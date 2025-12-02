export function cx(...p: Array<string | false | null | undefined>) {
  return p.filter(Boolean).join(" ");
}

export function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function pct(n: number) {
  const v = Math.max(0, Math.min(1, n));
  return `${Math.round(v * 1000) / 10}%`;
}

export function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
