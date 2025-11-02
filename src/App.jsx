import { useMemo, useState } from "react";
import Header from "./components/Header";
import SqlEditor from "./components/SqlEditor";
import Diagram from "./components/Diagram";
import SchemaSummary from "./components/SchemaSummary";
import { parseSQL } from "./components/sqlParser";

function App() {
  const [sql, setSql] = useState(`-- Write SQL CREATE TABLE statements here\n-- Use inline or table-level foreign keys to see relationships\n`);
  const schema = useMemo(() => parseSQL(sql), [sql]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="h-[420px] lg:h-[520px]">
          <SqlEditor value={sql} onChange={setSql} />
        </section>
        <section className="h-[420px] lg:h-[520px]">
          <Diagram schema={schema} />
        </section>
        <section className="lg:col-span-2">
          <SchemaSummary schema={schema} />
        </section>
      </main>
      <footer className="py-6 text-center text-xs text-gray-500">
        Paste your SQL, including PRIMARY KEY and FOREIGN KEY constraints, to visualize an ER diagram. Supports common Postgres/MySQL syntax.
      </footer>
    </div>
  );
}

export default App;
