import type { Tables } from "@/integrations/supabase/types";

export type Vehicle = Tables<"vehicles">;
export type Maintenance = Tables<"maintenances">;
export type MaintenanceRule = Tables<"maintenance_rules">;
export type Expense = Tables<"expenses">;
export type Profile = Tables<"profiles">;

export const MAINTENANCE_TYPES = [
  "troca de óleo",
  "filtro de óleo",
  "filtro de ar",
  "pastilhas de freio",
  "pneus",
  "bateria",
  "correia dentada",
  "amortecedores",
  "outros",
] as const;

export const EXPENSE_CATEGORIES = [
  "combustível",
  "seguro",
  "IPVA",
  "licenciamento",
  "oficina",
  "lavagem",
  "outros",
] as const;

export const MAINTENANCE_ICONS: Record<string, string> = {
  "troca de óleo": "🛢️",
  "filtro de óleo": "🔧",
  "filtro de ar": "🌬️",
  "pastilhas de freio": "🛑",
  pneus: "🛞",
  bateria: "🔋",
  "correia dentada": "⚙️",
  amortecedores: "🔩",
  outros: "🧰",
};

export const EXPENSE_ICONS: Record<string, string> = {
  combustível: "⛽",
  seguro: "🛡️",
  IPVA: "🏛️",
  licenciamento: "📄",
  oficina: "🔧",
  lavagem: "🧼",
  outros: "💳",
};

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatKm(km: number): string {
  return `${new Intl.NumberFormat("pt-BR").format(km)} km`;
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function vehicleLabel(v: Vehicle): string {
  return v.apelido || `${v.marca} ${v.modelo}`;
}

export type MaintenanceStatus = "ok" | "atencao" | "atrasado" | "sem_registro";

export interface MaintenanceHealth {
  rule: MaintenanceRule;
  last: Maintenance | null;
  status: MaintenanceStatus;
  kmRestante: number | null;
  diasRestantes: number | null;
  proximoKm: number | null;
  proximaData: string | null;
}

const ATENCAO_KM = 1000;
const ATENCAO_DIAS = 30;

export function computeMaintenanceHealth(
  rules: MaintenanceRule[],
  maintenances: Maintenance[],
  kmAtual: number,
): MaintenanceHealth[] {
  const now = new Date();
  return rules.map((rule) => {
    const last =
      maintenances
        .filter((m) => m.tipo === rule.tipo)
        .sort((a, b) => b.km - a.km || b.data.localeCompare(a.data))[0] ?? null;

    if (!last) {
      return {
        rule,
        last,
        status: "sem_registro",
        kmRestante: null,
        diasRestantes: null,
        proximoKm: null,
        proximaData: null,
      };
    }

    const proximoKm = last.km + rule.intervalo_km;
    const lastDate = new Date(`${last.data.slice(0, 10)}T12:00:00`);
    const dueDate = new Date(lastDate);
    dueDate.setMonth(dueDate.getMonth() + rule.intervalo_meses);
    const proximaData = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}-${String(dueDate.getDate()).padStart(2, "0")}`;

    const kmRestante = proximoKm - kmAtual;
    const diasRestantes = Math.ceil((dueDate.getTime() - now.getTime()) / 86400000);

    let status: MaintenanceStatus = "ok";
    if (kmRestante <= 0 || diasRestantes <= 0) status = "atrasado";
    else if (kmRestante <= ATENCAO_KM || diasRestantes <= ATENCAO_DIAS) status = "atencao";

    return { rule, last, status, kmRestante, diasRestantes, proximoKm, proximaData };
  });
}

export const STATUS_META: Record<
  MaintenanceStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  ok: {
    label: "Em dia",
    badgeClass: "bg-success/10 text-success",
    dotClass: "bg-success",
  },
  atencao: {
    label: "Atenção",
    badgeClass: "bg-warning/15 text-warning-foreground dark:text-warning",
    dotClass: "bg-warning",
  },
  atrasado: {
    label: "Atrasado",
    badgeClass: "bg-destructive/10 text-destructive",
    dotClass: "bg-destructive",
  },
  sem_registro: {
    label: "Sem registro",
    badgeClass: "bg-muted text-muted-foreground",
    dotClass: "bg-muted-foreground",
  },
};
