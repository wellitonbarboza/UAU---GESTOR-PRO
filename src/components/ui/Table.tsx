import React from "react";
import { cx } from "../lib/format";

export default function Table({
  columns,
  rows
}: {
  columns: { key: string; header: string; align?: "left" | "right" }[];
  rows: Record<string, any>[];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-50">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={cx(
                  "px-3 py-2 text-xs font-semibold text-zinc-600",
                  c.align === "right" ? "text-right" : "text-left"
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className={cx("border-t border-zinc-100", idx % 2 === 1 && "bg-white")}>
              {columns.map((c) => (
                <td key={c.key} className={cx("px-3 py-2", c.align === "right" ? "text-right" : "text-left")}>
                  {r[c.key]}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr className="border-t border-zinc-100">
              <td className="px-3 py-6 text-center text-sm text-zinc-500" colSpan={columns.length}>
                Nenhum dado.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
