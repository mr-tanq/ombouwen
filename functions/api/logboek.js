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

    await ensureTable(db);

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

  const section = stringOrEmpty(url.searchParams.get("section"));
  const toBiscuit = stringOrEmpty(url.searchParams.get("toBiscuit"));
  const toFormat = stringOrEmpty(url.searchParams.get("toFormat"));
  const line = stringOrEmpty(url.searchParams.get("line"));
  const limitParam = Number(url.searchParams.get("limit") || 100);
  const limit = Number.isFinite(limitParam)
    ? Math.max(1, Math.min(limitParam, 500))
    : 100;

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

  const stmt = db.prepare(`
    SELECT
      id,
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
    FROM logboek
    ${whereSql}
    ORDER BY created_at DESC, id DESC
    LIMIT ?
  `);

  const result = await stmt.bind(...params, limit).all();
  const rows = Array.isArray(result.results) ? result.results : [];

  return json({
    ok: true,
    count: rows.length,
    entries: rows.map((row) => ({
      id: row.id,
      action: row.action,
      section: row.section,
      line: row.line || "",
      toBiscuit: row.to_biscuit,
      toFormat: row.to_format,
      param: row.param,
      old: row.old_value,
      new_: row.new_value,
      note: row.note || "",
      ts: row.created_at
    }))
  });
}

async function handlePost(request, db) {
  const body = await request.json();

  const action = stringOrEmpty(body.action) || "saved";
  const section = stringOrEmpty(body.section);
  const line = stringOrEmpty(body.line);
  const toBiscuit = stringOrEmpty(body.toBiscuit);
  const toFormat = stringOrEmpty(body.toFormat);
  const param = stringOrEmpty(body.param);
  const oldValue = stringOrEmpty(body.old);
  const newValue = stringOrEmpty(body.new_);
  const note = stringOrEmpty(body.note);
  const ts = stringOrEmpty(body.ts) || new Date().toISOString();

  if (!section || !toBiscuit || !toFormat || !param) {
    return json(
      {
        ok: false,
        error: "section, toBiscuit, toFormat and param are required."
      },
      400
    );
  }

  const stmt = db.prepare(`
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

  const result = await stmt
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
    entry: {
      id: result.meta?.last_row_id || null,
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
}

async function ensureTable(db) {
  await db.exec(`
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