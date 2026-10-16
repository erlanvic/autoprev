import { createFileRoute, Link } from "@tanstack/react-router";
import { Car, ChevronRight, PiggyBank, TrendingUp, Wrench } from "lucide-react";
import { HealthCard } from "@/components/app/health-card";
import { useActiveVehicle, useExpenses, useMaintenances, useMaintenanceRules, useProfile, useVehicles } from "@/hooks/use-vehicles";
import { computeMaintenanceHealth, formatBRL, formatKm, vehicleLabel } from "@/lib/autoprev";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Início — AutoPrev" },
      {
        name: "description",
        content: "Veja a saúde do seu veículo, as próximas manutenções e quanto você já economizou com prevenção.",
      },
      { property: "og:title", content: "Início — AutoPrev" },
      {
        property: "og:description",
        content: "Veja a saúde do seu veículo, as próximas manutenções e quanto você já economizou com prevenção.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomePage,
});

const ORDER = { atrasado: 0, atencao: 1, sem_registro: 2, ok: 3 } as const;

function HomePage() {
  const vehiclesQuery = useVehicles();
  const vehicle = useActiveVehicle(vehiclesQuery.data);
  const profileQuery = useProfile();
  const rulesQuery = useMaintenanceRules();
  const maintenancesQuery = useMaintenances(vehicle?.id);
  const expensesQuery = useExpenses(vehicle?.id);

  const nome = profileQuery.data?.profile.nome?.split(" ")[0] ?? "motorista";

  const health =
    vehicle && rulesQuery.data && maintenancesQuery.data
      ? computeMaintenanceHealth(rulesQuery.data, maintenancesQuery.data, vehicle.km_atual).sort(
          (a, b) => ORDER[a.status] - ORDER[b.status],
        )
      : [];

  // Economia estimada: custo evitado de cada manutenção preventiva já feita
  const economia = (() => {
    if (!maintenancesQuery.data || !rulesQuery.data) return 0;
    const ruleByTipo = new Map(rulesQuery.data.map((r) => [r.tipo, Number(r.custo_evitado_estimado)]));
    return maintenancesQuery.data.reduce((sum, m) => sum + (ruleByTipo.get(m.tipo) ?? 0), 0);
  })();

  const gastoMes = (() => {
    if (!expensesQuery.data) return 0;
    const now = new Date();
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return expensesQuery.data
      .filter((e) => e.data.startsWith(prefix))
      .reduce((s, e) => s + Number(e.valor), 0);
  })();

  const loading = vehiclesQuery.isLoading || maintenancesQuery.isLoading;

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Olá, {nome} 👋</h1>
      </div>

      {/* Vehicle hero */}
      {vehicle && (
        <div className="relative overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground shadow-fab">
          <div className="absolute -right-6 -top-8 opacity-15">
            <Car className="h-40 w-40" strokeWidth={1} />
          </div>
          <p className="text-xs font-medium uppercase tracking-wide opacity-80">Veículo ativo</p>
          <h2 className="mt-1 text-xl font-extrabold">{vehicleLabel(vehicle)}</h2>
          <p className="text-sm opacity-80">
            {vehicle.marca} {vehicle.modelo} · {vehicle.ano}
            {vehicle.placa ? ` · ${vehicle.placa}` : ""}
          </p>
          <p className="mt-4 text-2xl font-extrabold">{formatKm(vehicle.km_atual)}</p>
          <p className="text-xs opacity-80">quilometragem atual</p>
        </div>
      )}

      {/* Savings + month spend */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-success/10 text-success">
            <PiggyBank className="h-4.5 w-4.5" />
          </span>
          <p className="mt-3 text-lg font-extrabold text-success">{formatBRL(economia)}</p>
          <p className="text-xs text-muted-foreground">economia estimada com prevenção</p>
        </div>
        <Link to="/gastos" className="rounded-3xl border border-border bg-card p-4 shadow-card transition-transform active:scale-[0.98]">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <TrendingUp className="h-4.5 w-4.5" />
          </span>
          <p className="mt-3 text-lg font-extrabold text-foreground">{formatBRL(gastoMes)}</p>
          <p className="text-xs text-muted-foreground">gastos deste mês</p>
        </Link>
      </div>

      {/* Vehicle health */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Saúde do veículo</h2>
          <Link to="/historico" className="flex items-center text-xs font-semibold text-primary">
            Histórico <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-3xl bg-muted" />
            ))}
          </div>
        ) : health.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-6 text-center shadow-card">
            <Wrench className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Registre sua primeira manutenção para começar a acompanhar.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {health.map((h) => (
              <HealthCard key={h.rule.tipo} health={h} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
