import { useEffect, useMemo, useState } from "react";
import { Wand2, Download } from "lucide-react";

export default function SqlEditor({ value, onChange }) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  // Debounce typing
  useEffect(() => {
    const t = setTimeout(() => onChange(local), 300);
    return () => clearTimeout(t);
  }, [local, onChange]);

  const download = useMemo(() => {
    return () => {
      const blob = new Blob([local || ""], { type: "text/sql;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "schema.sql";
      a.click();
      URL.revokeObjectURL(url);
    };
  }, [local]);

  const example = `-- Example schema\nCREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  email VARCHAR(255) NOT NULL UNIQUE,\n  name TEXT,\n  created_at TIMESTAMP\n);\n\nCREATE TABLE posts (\n  id SERIAL PRIMARY KEY,\n  author_id INT NOT NULL REFERENCES users(id),\n  title TEXT NOT NULL,\n  body TEXT,\n  created_at TIMESTAMP\n);\n\nCREATE TABLE comments (\n  id SERIAL PRIMARY KEY,\n  post_id INT NOT NULL,\n  author_id INT NOT NULL,\n  body TEXT NOT NULL,\n  FOREIGN KEY (post_id) REFERENCES posts(id),\n  FOREIGN KEY (author_id) REFERENCES users(id)\n);`;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-gray-700">SQL</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLocal(example)}
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
          >
            <Wand2 className="h-4 w-4" />
            Load example
          </button>
          <button
            onClick={download}
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>
      <textarea
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder="Write SQL CREATE TABLE statements here..."
        spellCheck={false}
        className="flex-1 font-mono text-sm rounded-lg border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-none"
      />
    </div>
  );
}
