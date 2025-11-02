import { Database, Github } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full border-b bg-white/70 backdrop-blur sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">SQL ER Diagram Builder</h1>
            <p className="text-xs text-gray-500 -mt-0.5">Type SQL, see your schema come alive</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <a
            href="https://www.dbdiagram.io/home"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
          >
            Inspired by dbdiagram.io
          </a>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            <Github className="h-4 w-4" />
            <span>Star</span>
          </a>
        </div>
      </div>
    </header>
  );
}
