import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "@/components/app/empty-state";
import { useActiveVehicle, useExpenses, useMaintenances, useVehicles } from "@/hooks/use-vehicles";
import { formatBRL } from "@/lib/autoprev";

export const Route = createFileRoute("/_authenticated/estatisticas")({
  head: () => ({
    meta: [
      { title: "Estatísticas — AutoPrev" },
      { name: "description", content: "Gráficos de gastos e manutenções do seu veículo." },
      { property: "og:title", content: "Estatísticas — AutoPrev" },
      { property: "og:description", content: "Gráficos de gastos e manutenções do seu veículo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StatsPage,
});

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
  "var(--muted-foreground)",
];

function StatsPage() {
  const { data: vehicles } = useVehicles();
  const vehicle = useActiveVehicle(vehicles);
  const { data: expenses, isLoading: loadingExpenses } = useExpenses(vehicle?.id);
  const { data: maintenances, isLoading: loadingMaintenances } = useMaintenances(vehicle?.id);

  const monthly = useMemo(() => {
    const now = new Date();
    const buckets: { key: string; label: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
        total: 0,
      });
    }
    for (const e of expenses ?? []) {
      const b = buckets.find((x) => e.data.startsWith(x.key));
      if (b) b.total += Number(e.valor);
    }
    for (const m of maintenances ?? []) {
      const b = buckets.find((x) => m.data.startsWith(x.key));
      if (b) b.total += Number(m.valor);
    }
    return buckets;
  }, [expenses, maintenances]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of expenses ?? []) {
      map.set(e.categoria, (map.get(e.categoria) ?? 0) + Number(e.valor));
    }
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const loading = loadingExpenses || loadingMaintenances;
  const hasData = (expenses?.length ?? 0) + (maintenances?.length ?? 0) > 0;

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Estatísticas</h1>

      {loading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
      ) : !hasData ? (
        <EmptyState
          icon={<BarChart3 className="h-7 w-7" />}
          title="Sem dados suficientes"
          description="Registre manutenções e gastos para ver gráficos de evolução mensal e distribuição por categoria."
        />
      ) : (
        <>
          <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
            <h2 className="text-sm font-bold text-foreground">Gastos + manutenções por mês</h2>
            <p className="text-xs text-muted-foreground">últimos 6 meses</p>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
                  <Tooltip
                    formatter={(value) => [formatBRL(Number(value)), "Total"]}
                    cursor={{ fill: "var(--muted)" }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      color: "var(--foreground)",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="total" fill="var(--chart-1)" radius={[8, 8, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {byCategory.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
              <h2 className="text-sm font-bold text-foreground">Gastos por categoria</h2>
              <p className="text-xs text-muted-foreground">acumulado do veículo ativo</p>
              <div className="mt-2 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byCategory}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {byCategory.map((entry, i) => (
                        <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [formatBRL(Number(value)), "Total"]}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                        background: "var(--card)",
                        color: "var(--foreground)",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {byCategory.map((c, i) => (
                  <span key={c.name} className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium capitalize text-secondary-foreground">
                    <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
