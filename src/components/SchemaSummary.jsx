export default function SchemaSummary({ schema }) {
  const tables = schema.tables || [];
  return (
    <div className="h-full flex flex-col">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-700">Summary</h2>
      </div>
      <div className="flex-1 overflow-auto rounded-lg border border-gray-200 bg-white p-3 text-sm">
        {tables.length === 0 ? (
          <p className="text-gray-500">No tables detected yet. Start typing SQL.</p>
        ) : (
          <ul className="space-y-4">
            {tables.map((t) => (
              <li key={t.name}>
                <div className="font-semibold text-gray-900">{t.name}</div>
                <ul className="mt-1 ml-3 list-disc text-gray-700">
                  {t.columns.map((c) => (
                    <li key={c.name}>
                      <span className="font-mono">{c.name}</span>
                      <span className="text-gray-500">: {c.type}</span>
                      {c.pk ? <span className="ml-1 text-emerald-600">(PK)</span> : null}
                      {c.unique && !c.pk ? <span className="ml-1 text-indigo-600">(UNIQUE)</span> : null}
                      {c.notNull ? <span className="ml-1 text-rose-600">(NOT NULL)</span> : null}
                    </li>
                  ))}
                </ul>
                {t.fks && t.fks.length > 0 && (
                  <div className="mt-1 ml-3 text-gray-600">
                    References: {t.fks.map((f, i) => (
                      <span key={i} className="font-mono">
                        {t.name}.{f.from} → {f.toTable}.{f.toColumn}
                        {i < t.fks.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
