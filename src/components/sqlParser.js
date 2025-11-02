// A lightweight SQL parser for CREATE TABLE statements
// Supports column definitions, PRIMARY KEY, and FOREIGN KEY ... REFERENCES ...

export function parseSQL(sql) {
  const tables = [];
  const tableMap = new Map();

  if (!sql || typeof sql !== "string") return { tables: [] };

  // Normalize whitespace and split into statements
  const cleaned = sql
    .replace(/--.*$/gm, "") // remove inline comments
    .replace(/\/\*[\s\S]*?\*\//g, "") // remove block comments
    .replace(/\n+/g, "\n");

  const statements = cleaned
    .split(/;\s*(?=CREATE\s+TABLE|create\s+table|$)/g)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    const match = stmt.match(/create\s+table\s+(if\s+not\s+exists\s+)?([`"\[]?)([A-Za-z0-9_]+)\2\s*\(([\s\S]*)\)/i);
    if (!match) continue;

    const tableName = match[3];
    const body = match[4];

    const table = {
      name: tableName,
      columns: [], // { name, type, pk, notNull, unique }
      fks: [], // { from, toTable, toColumn }
    };

    // Split body by commas but ignore commas inside parentheses
    const parts = splitSQLParts(body);

    const tableLevelPK = [];

    for (let raw of parts) {
      const line = raw.trim().replace(/^,|,$/g, "");
      if (!line) continue;

      // Table-level primary key
      const tpk = line.match(/primary\s+key\s*\(([^\)]*)\)/i);
      if (tpk) {
        const cols = tpk[1]
          .split(",")
          .map((c) => c.replace(/[`"\[\]]/g, "").trim())
          .filter(Boolean);
        tableLevelPK.push(...cols);
        continue;
      }

      // Table-level foreign key
      const tfk = line.match(/foreign\s+key\s*\(([^\)]*)\)\s*references\s+([`"\[]?)([A-Za-z0-9_]+)\2\s*\(([^\)]*)\)/i);
      if (tfk) {
        const fromCols = tfk[1]
          .split(",")
          .map((c) => c.replace(/[`"\[\]]/g, "").trim());
        const toTable = tfk[3];
        const toCols = tfk[4]
          .split(",")
          .map((c) => c.replace(/[`"\[\]]/g, "").trim());
        fromCols.forEach((from, i) => {
          table.fks.push({ from, toTable, toColumn: toCols[i] || toCols[0] });
        });
        continue;
      }

      // Column definition
      const colMatch = line.match(/^([`"\[]?)([A-Za-z0-9_]+)\1\s+([A-Za-z0-9_()]+)([\s\S]*)$/i);
      if (colMatch) {
        const name = colMatch[2];
        const type = colMatch[3];
        const rest = colMatch[4] || "";
        const pk = /primary\s+key/i.test(rest);
        const notNull = /not\s+null/i.test(rest);
        const unique = /unique(\s+|$)/i.test(rest);

        // Inline FK: REFERENCES other(col)
        const inlineFK = rest.match(/references\s+([`"\[]?)([A-Za-z0-9_]+)\1\s*\(([^\)]*)\)/i);
        if (inlineFK) {
          const toTable = inlineFK[2];
          const toColumn = inlineFK[3].split(",")[0].replace(/[`"\[\]]/g, "").trim();
          table.fks.push({ from: name, toTable, toColumn });
        }

        table.columns.push({ name, type, pk, notNull, unique });
      }
    }

    // Apply table-level PK to columns
    for (const c of table.columns) {
      if (tableLevelPK.includes(c.name)) c.pk = true;
    }

    tables.push(table);
    tableMap.set(table.name, table);
  }

  return { tables };
}

function splitSQLParts(body) {
  const parts = [];
  let buf = "";
  let depth = 0;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(buf);
      buf = "";
    } else {
      buf += ch;
    }
  }
  if (buf.trim()) parts.push(buf);
  return parts;
}
