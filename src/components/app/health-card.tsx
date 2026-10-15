import { Link } from "@tanstack/react-router";
import {
  formatBRL,
  formatDate,
  formatKm,
  MAINTENANCE_ICONS,
  STATUS_META,
  type MaintenanceHealth,
} from "@/lib/autoprev";

export function HealthCard({ health }: { health: MaintenanceHealth }) {
  const meta = STATUS_META[health.status];

  let detail = "Registre a primeira manutenção";
  if (health.status === "ok" && health.kmRestante != null && health.diasRestantes != null) {
    detail = `Faltam ${formatKm(health.kmRestante)} ou ${health.diasRestantes} dias`;
  } else if (health.status === "atencao" && health.kmRestante != null) {
    detail = `Faltam só ${formatKm(Math.max(health.kmRestante, 0))} ou ${Math.max(health.diasRestantes ?? 0, 0)} dias`;
  } else if (health.status === "atrasado") {
    const km = health.kmRestante != null ? Math.abs(Math.min(health.kmRestante, 0)) : 0;
    detail = km > 0 ? `Passou ${formatKm(km)} do limite` : "Passou do prazo";
  }

  return (
    <Link
      to="/manutencoes/nova"
      search={{ tipo: health.rule.tipo }}
      className="flex items-center gap-3 rounded-3xl border border-border bg-card p-4 shadow-card transition-transform active:scale-[0.98]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-xl">
        {MAINTENANCE_ICONS[health.rule.tipo] ?? "🧰"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold capitalize text-foreground">
            {health.rule.tipo}
          </span>
          <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dotClass}`} />
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{detail}</span>
        {health.last && (
          <span className="block text-[11px] text-muted-foreground/80">
            Última: {formatDate(health.last.data)} · {formatKm(health.last.km)}
          </span>
        )}
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.badgeClass}`}>
          {meta.label}
        </span>
        <span className="text-[11px] font-medium text-success">
          evita ~{formatBRL(Number(health.rule.custo_evitado_estimado))}
        </span>
      </span>
    </Link>
  );
}
