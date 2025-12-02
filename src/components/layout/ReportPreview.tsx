import React from "react";
import { Building, FileText } from "lucide-react";

export function ReportPreview({
  title,
  subtitle,
  blocks,
}: {
  title: string;
  subtitle: string;
  blocks: { label: string; value: string }[];
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-semibold">{title}</div>
            <div className="mt-1 text-xs text-zinc-500">{subtitle}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-2">
              <Building className="h-4 w-4" />
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-2">
              <FileText className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-3 p-4 md:grid-cols-3">
        {blocks.map((b) => (
          <div key={b.label} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
            <div className="text-xs text-zinc-500">{b.label}</div>
            <div className="mt-1 text-sm font-semibold">{b.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
