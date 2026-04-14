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

    const method = request.method.toUpperCase();

    if (method === "GET") {
      return handleGet(request, db);
    }

    if (method === "POST") {
      return handlePost(request, db);
    }

    return json(
      {
        ok: false,
        error: "Method not allowed."
      },
      405
    );
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

async function handleGet(request, db) {
  const url = new URL(request.url);

  const section = (url.searchParams.get("section") || "").trim();
  const toBiscuit = (url.searchParams.get("toBiscuit") || "").trim();
  const toFormat = (url.searchParams.get("toFormat") || "").trim();
  const line = (url.searchParams.get("line") || "").trim();

  const where = [];
  const params = [];

  if (section) {
    where.push("section = ?");
    params.push(section);
  }

  if (toBiscuit) {
    where.push("to_biscuit = ?");
    params.push(toBiscuit);
  }

  if (toFormat) {
    where.push("to_format = ?");
    params.push(toFormat);
  }

  if (line) {
    where.push("line = ?");
    params.push(line);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const versionsStmt = db.prepare(`
    SELECT
      id,
      version_no,
      section,
      line,
      to_biscuit,
      to_format,
      created_at,
      locked
    FROM versions
    ${whereSql}
    ORDER BY created_at DESC, id DESC
  `);

  const versionsResult = await versionsStmt.bind(...params).all();
  const versions = Array.isArray(versionsResult.results)
    ? versionsResult.results
    : [];

  const versionIds = versions.map((v) => v.id);

  let changesByVersionId = {};
  if (versionIds.length) {
    const placeholders = versionIds.map(() => "?").join(",");

    const changesStmt = db.prepare(`
      SELECT
        id,
        version_id,
        param,
        old_value,
        new_value,
        note
      FROM version_changes
      WHERE version_id IN (${placeholders})
      ORDER BY id ASC
    `);

    const changesResult = await changesStmt.bind(...versionIds).all();
    const changes = Array.isArray(changesResult.results)
      ? changesResult.results
      : [];

    changesByVersionId = changes.reduce((acc, row) => {
      if (!acc[row.version_id]) acc[row.version_id] = [];
      acc[row.version_id].push({
        id: row.id,
        param: row.param,
        old: row.old_value,
        new_: row.new_value,
        note: row.note || ""
      });
      return acc;
    }, {});
  }

  const payload = versions.map((row) => ({
    id: row.id,
    v: row.version_no,
    section: row.section,
    line: row.line || "",
    toBiscuit: row.to_biscuit,
    toFormat: row.to_format,
    ts: row.created_at,
    locked: !!row.locked,
    changes: changesByVersionId[row.id] || []
  }));

  return json({
    ok: true,
    count: payload.length,
    versions: payload
  });
}

async function handlePost(request, db) {
  const body = await request.json();

  const section = stringOrEmpty(body.section);
  const line = stringOrEmpty(body.line);
  const toBiscuit = stringOrEmpty(body.toBiscuit);
  const toFormat = stringOrEmpty(body.toFormat);
  const ts = stringOrEmpty(body.ts) || new Date().toISOString();

  const changes = Array.isArray(body.changes) ? body.changes : [];

  if (!section || !toBiscuit || !toFormat) {
    return json(
      {
        ok: false,
        error: "section, toBiscuit and toFormat are required."
      },
      400
    );
  }

  if (!changes.length) {
    return json(
      {
        ok: false,
        error: "At least one change is required."
      },
      400
    );
  }

  const latestStmt = db.prepare(`
    SELECT version_no
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

  const nextVersionNo = latest?.version_no ? Number(latest.version_no) + 1 : 1;

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
    .bind(nextVersionNo, section, line, toBiscuit, toFormat, ts, 1)
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

  for (const change of changes) {
    const param = stringOrEmpty(change.param);
    const oldValue = stringOrEmpty(change.old);
    const newValue = stringOrEmpty(change.new_);
    const note = stringOrEmpty(change.note);

    if (!param) continue;

    await insertChangeStmt
      .bind(versionId, param, oldValue, newValue, note)
      .run();
  }

  return json({
    ok: true,
    version: {
      id: versionId,
      v: nextVersionNo,
      section,
      line,
      toBiscuit,
      toFormat,
      ts
    }
  });
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

    CREATE INDEX IF NOT EXISTS idx_versions_lookup
    ON versions(section, to_biscuit, to_format, line, version_no);

    CREATE INDEX IF NOT EXISTS idx_version_changes_version_id
    ON version_changes(version_id);
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
