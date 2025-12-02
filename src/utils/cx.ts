export function cx(...p: Array<string | false | null | undefined>) {
  return p.filter(Boolean).join(" ");
}

