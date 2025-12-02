export function brl(n: number) {
  try {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  } catch {
    return `R$ ${n.toFixed(2)}`;
  }
}

export function pct(n: number) {
  const v = Math.max(0, Math.min(1, n));
  return `${Math.round(v * 1000) / 10}%`;
}

export function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

