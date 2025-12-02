import React from "react";
import { cx } from "../lib/format";

export default function StatusPill({ tone, text }: { tone: "ok" | "warn" | "muted" | "danger"; text: string }) {
  const cls =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : tone === "warn"
        ? "bg-amber-50 text-amber-900 border-amber-200"
        : tone === "danger"
          ? "bg-rose-50 text-rose-800 border-rose-200"
          : "bg-zinc-50 text-zinc-700 border-zinc-200";

  return <span className={cx("inline-flex items-center rounded-full border px-2 py-0.5 text-xs", cls)}>{text}</span>;
}
