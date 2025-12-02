import type { ReactNode } from "react";

export type PageKey =
  | "AUTH"
  | "DASH"
  | "DADOS"
  | "OBRAS"
  | "CONTRATO_NOVO"
  | "CONTRATO_ADITIVO"
  | "CONTRATO_CONSULTA"
  | "CONTRATO_EQUALIZACAO"
  | "CONTRATO_DISTRATO"
  | "SUP_NOVO"
  | "SUP_CONSULTA"
  | "HIST";

export type MenuGroup = "ROOT" | "CONTRATOS" | "SUP";

export type MenuItem = {
  key: PageKey;
  label: string;
  icon: ReactNode;
  group: MenuGroup;
};

