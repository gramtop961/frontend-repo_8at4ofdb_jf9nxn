import { useMemo, useRef, useState } from "react";
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react";

function TableBox({ table, x, y, scale }) {
  const width = 220;
  const rowH = 22;
  const headerH = 30;
  const height = headerH + table.columns.length * rowH + 12;

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <rect width={width} height={height} rx={8} fill="#ffffff" stroke="#E5E7EB" />
      <rect width={width} height={headerH} rx={8} fill="#EEF2FF" />
      <text x={12} y={20} fontSize={12} fontWeight={600} fill="#3730A3">
        {table.name}
      </text>
      {table.columns.map((c, i) => (
        <g key={c.name} transform={`translate(0, ${headerH + i * rowH})`}>
          <rect width={width} height={rowH} fill={i % 2 ? "#FAFAFA" : "#FFFFFF"} />
          <text x={12} y={15} fontSize={12} fill="#111827">
            {c.name}
            <tspan fill="#6B7280">: {c.type}</tspan>
            {c.pk ? <tspan fill="#059669"> PK</tspan> : null}
            {c.unique && !c.pk ? <tspan fill="#2563EB"> UQ</tspan> : null}
            {c.notNull ? <tspan fill="#DC2626"> NN</tspan> : null}
          </text>
        </g>
      ))}
    </g>
  );
}

function autoLayout(tables) {
  const positions = new Map();
  const colW = 280;
  const rowH = 240;
  const cols = Math.max(1, Math.ceil(Math.sqrt(tables.length)));
  tables.forEach((t, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions.set(t.name, { x: 40 + col * colW, y: 40 + row * rowH });
  });
  return positions;
}

export default function Diagram({ schema }) {
  const [scale, setScale] = useState(1);
  const positions = useMemo(() => autoLayout(schema.tables || []), [schema]);
  const svgRef = useRef(null);

  const increase = () => setScale((s) => Math.min(2, s + 0.1));
  const decrease = () => setScale((s) => Math.max(0.4, s - 0.1));
  const reset = () => setScale(1);

  // Calculate canvas size
  const maxX = Math.max(800, ...Array.from(positions.values()).map((p) => p.x)) + 400;
  const maxY = Math.max(600, ...Array.from(positions.values()).map((p) => p.y)) + 400;

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-gray-700">Diagram</h2>
        <div className="flex items-center gap-2">
          <button onClick={decrease} className="p-2 rounded-md bg-gray-100 hover:bg-gray-200">
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs text-gray-500 w-10 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={increase} className="p-2 rounded-md bg-gray-100 hover:bg-gray-200">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button onClick={reset} className="p-2 rounded-md bg-gray-100 hover:bg-gray-200">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 rounded-lg border border-gray-200 bg-white overflow-hidden">
        <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${maxX} ${maxY}`}>          
          {/* Relations */}
          {(schema.tables || []).flatMap((t) =>
            (t.fks || []).map((fk, idx) => {
              const from = positions.get(t.name);
              const to = positions.get(fk.toTable);
              if (!from || !to) return null;
              const x1 = from.x + 220; // right edge of table box
              const y1 = from.y + 30 + 14; // near header
              const x2 = to.x; // left edge of target
              const y2 = to.y + 30 + 14;
              const mx = (x1 + x2) / 2;
              return (
                <g key={`${t.name}-${fk.toTable}-${idx}`}>
                  <path
                    d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                    stroke="#94A3B8"
                    strokeWidth={1.5}
                    fill="none"
                  />
                  {/* crow's foot simple marker */}
                  <path d={`M ${x2} ${y2} m -6 -6 l 6 6 l -6 6`} stroke="#1F2937" strokeWidth={1.5} fill="none" />
                </g>
              );
            })
          )}

          {/* Tables */}
          {(schema.tables || []).map((t) => {
            const p = positions.get(t.name) || { x: 40, y: 40 };
            return <TableBox key={t.name} table={t} x={p.x} y={p.y} scale={1} />;
          })}
        </svg>
      </div>
    </div>
  );
}
