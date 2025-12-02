import React from "react";

export function KPI({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-zinc-500">{label}</div>
          <div className="mt-1 text-lg font-semibold tracking-tight">{value}</div>
          {hint ? <div className="mt-1 text-xs text-zinc-500">{hint}</div> : null}
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-2 text-zinc-700">{icon}</div>
      </div>
    </div>
  );
}
