import React from "react";
import {
  LayoutDashboard,
  FileUp,
  Package,
  Building2,
  FileText,
  ClipboardList,
  BadgeCheck,
  FileSearch,
  Scale,
  History,
  GitBranch,
  FileSignature,
} from "lucide-react";
import type { MenuItem } from "../types/navigation";

export const MENU: MenuItem[] = [
  { key: "DASH", label: "Início", icon: <LayoutDashboard className="h-4 w-4" />, group: "ROOT" },
  { key: "DADOS", label: "Dados (Upload)", icon: <FileUp className="h-4 w-4" />, group: "SUP" },
  { key: "OBRAS", label: "Obras", icon: <Building2 className="h-4 w-4" />, group: "SUP" },

  { key: "CONTRATO_NOVO", label: "Análise — Novo", icon: <FileText className="h-4 w-4" />, group: "CONTRATOS" },
  { key: "CONTRATO_ADITIVO", label: "Análise — Aditivo", icon: <GitBranch className="h-4 w-4" />, group: "CONTRATOS" },
  { key: "CONTRATO_DISTRATO", label: "Distrato", icon: <Scale className="h-4 w-4" />, group: "CONTRATOS" },
  { key: "CONTRATO_CONSULTA", label: "Consulta", icon: <FileSearch className="h-4 w-4" />, group: "CONTRATOS" },
  { key: "CONTRATO_EQUALIZACAO", label: "Equalização", icon: <BadgeCheck className="h-4 w-4" />, group: "CONTRATOS" },

  { key: "SUP_NOVO", label: "Compras — Novo Pedido", icon: <Package className="h-4 w-4" />, group: "SUP" },
  { key: "SUP_CONSULTA", label: "Consulta — Insumos", icon: <ClipboardList className="h-4 w-4" />, group: "SUP" },

  { key: "HIST", label: "Histórico", icon: <History className="h-4 w-4" />, group: "ROOT" },
];
