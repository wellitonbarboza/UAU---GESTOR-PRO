import React from "react";
import { cx } from "../../utils/cx";

export function IconButton({
  onClick,
  children,
  title,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50"
    >
      {children}
    </button>
  );
}

export function PrimaryButton({
  onClick,
  children,
  disabled,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "inline-flex items-center gap-2 rounded-2xl bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      {children}
    </button>
  );
}
