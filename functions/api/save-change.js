export async function onRequest(context) {
  try {
    const { request, env } = context;
    const db = env.DB;

    if (!db) {
      return json(
        {
          ok: false,
          error: "D1 binding 'DB' not found."
        },
        500
      );
    }

    await ensureTables(db);

    if (request.method.toUpperCase() !== "POST") {
      return json(
        {
          ok: false,
          error: "Method not allowed."
        },
        405
      );
    }

    const body = await request.json();

    const section = stringOrEmpty(body.section);
    const line = stringOrEmpty(body.line);
    const toBiscuit = stringOrEmpty(body.toBiscuit);
    const toFormat = stringOrEmpty(body.toFormat);
    const param = stringOrEmpty(body.param);
    const oldValue = stringOrEmpty(body.old);
    const newValue = stringOrEmpty(body.new_);
    const note = stringOrEmpty(body.note);
    const ts = stringOrEmpty(body.ts) || new Date().toISOString();
    const action = stringOrEmpty(body.action) || "saved";

    if (!section || !toBiscuit || !toFormat || !param) {
      return json(
        {
          ok: false,
          error: "section, toBiscuit, toFormat and param are required."
        },
        400
      );
    }

    const latestStmt = db.prepare(`
      SELECT id, version_no
      FROM versions
      WHERE section = ?
        AND to_biscuit = ?
        AND to_format = ?
        AND line = ?
      ORDER BY version_no DESC
      LIMIT 1
    `);

    const latest = await latestStmt
      .bind(section, toBiscuit, toFormat, line)
      .first();

    const nextVersionNo = latest?.version_no
      ? Number(latest.version_no) + 1
      : 1;

    const insertVersionStmt = db.prepare(`
      INSERT INTO versions (
        version_no,
        section,
        line,
        to_biscuit,
        to_format,
        created_at,
        locked
      )
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);

    const versionResult = await insertVersionStmt
      .bind(
        nextVersionNo,
        section,
        line,
        toBiscuit,
        toFormat,
        ts
      )
      .run();

    const versionId = versionResult.meta?.last_row_id;

    if (!versionId) {
      return json(
        {
          ok: false,
          error: "Failed to create version."
        },
        500
      );
    }

    const insertChangeStmt = db.prepare(`
      INSERT INTO version_changes (
        version_id,
        param,
        old_value,
        new_value,
        note
      )
      VALUES (?, ?, ?, ?, ?)
    `);

    await insertChangeStmt
      .bind(
        versionId,
        param,
        oldValue,
        newValue,
        note
      )
      .run();

    const insertLogStmt = db.prepare(`
      INSERT INTO logboek (
        action,
        section,
        line,
        to_biscuit,
        to_format,
        param,
        old_value,
        new_value,
        note,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const logResult = await insertLogStmt
      .bind(
        action,
        section,
        line,
        toBiscuit,
        toFormat,
        param,
        oldValue,
        newValue,
        note,
        ts
      )
      .run();

    return json({
      ok: true,
      version: {
        id: versionId,
        v: nextVersionNo,
        section,
        line,
        toBiscuit,
        toFormat,
        ts,
        locked: true,
        changes: [
          {
            param,
            old: oldValue,
            new_: newValue,
            note
          }
        ]
      },
      logboek: {
        id: logResult.meta?.last_row_id || null,
        action,
        section,
        line,
        toBiscuit,
        toFormat,
        param,
        old: oldValue,
        new_: newValue,
        note,
        ts
      }
    });
  } catch (error) {
    return json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      500
    );
  }
}

async function ensureTables(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version_no INTEGER NOT NULL,
      section TEXT NOT NULL,
      line TEXT NOT NULL DEFAULT '',
      to_biscuit TEXT NOT NULL,
      to_format TEXT NOT NULL,
      created_at TEXT NOT NULL,
      locked INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS version_changes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version_id INTEGER NOT NULL,
      param TEXT NOT NULL,
      old_value TEXT NOT NULL DEFAULT '',
      new_value TEXT NOT NULL DEFAULT '',
      note TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (version_id) REFERENCES versions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS logboek (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL DEFAULT 'saved',
      section TEXT NOT NULL,
      line TEXT NOT NULL DEFAULT '',
      to_biscuit TEXT NOT NULL,
      to_format TEXT NOT NULL,
      param TEXT NOT NULL,
      old_value TEXT NOT NULL DEFAULT '',
      new_value TEXT NOT NULL DEFAULT '',
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_versions_lookup
    ON versions(section, to_biscuit, to_format, line, version_no);

    CREATE INDEX IF NOT EXISTS idx_version_changes_version_id
    ON version_changes(version_id);

    CREATE INDEX IF NOT EXISTS idx_logboek_lookup
    ON logboek(section, to_biscuit, to_format, line, created_at);

    CREATE INDEX IF NOT EXISTS idx_logboek_param
    ON logboek(param, created_at);
  `);
}

function stringOrEmpty(value) {
  return typeof value === "string" ? value.trim() : "";
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}
