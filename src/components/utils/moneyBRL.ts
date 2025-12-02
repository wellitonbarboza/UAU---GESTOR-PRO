export function moneyBRL(n: number) {
  const v = Math.round((n + Number.EPSILON) * 100) / 100;
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}