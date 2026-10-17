import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Plus, Wallet } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { useActiveVehicle, useExpenses, useVehicles } from "@/hooks/use-vehicles";
import { EXPENSE_ICONS, formatBRL, formatDate, type Expense } from "@/lib/autoprev";

export const Route = createFileRoute("/_authenticated/gastos")({
  head: () => ({
    meta: [
      { title: "Gastos — AutoPrev" },
      { name: "description", content: "Acompanhe os gastos do seu veículo por categoria, mês e ano." },
      { property: "og:title", content: "Gastos — AutoPrev" },
      { property: "og:description", content: "Acompanhe os gastos do seu veículo por categoria, mês e ano." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const { data: vehicles } = useVehicles();
  const vehicle = useActiveVehicle(vehicles);
  const { data: expenses, isLoading } = useExpenses(vehicle?.id);

  const totals = useMemo(() => {
    const list = expenses ?? [];
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const yearPrefix = String(now.getFullYear());
    const sum = (items: Expense[]) => items.reduce((s, e) => s + Number(e.valor), 0);
    return {
      mes: sum(list.filter((e) => e.data.startsWith(monthPrefix))),
      ano: sum(list.filter((e) => e.data.startsWith(yearPrefix))),
      total: sum(list),
    };
  }, [expenses]);

  const groups = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const e of expenses ?? []) {
      const [y = 0, mo = 1] = e.data.slice(0, 7).split("-").map(Number);
      const key = new Date(y, mo - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      map.set(key, [...(map.get(key) ?? []), e]);
    }
    return [...map.entries()];
  }, [expenses]);

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Gastos</h1>
        <Link to="/gastos/novo">
          <Button size="sm" className="rounded-xl">
            <Plus className="mr-1 h-4 w-4" /> Novo gasto
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Este mês", value: totals.mes },
          { label: "Este ano", value: totals.ano },
          { label: "Acumulado", value: totals.total },
        ].map((t) => (
          <div key={t.label} className="rounded-3xl border border-border bg-card p-3.5 text-center shadow-card">
            <p className="text-sm font-extrabold text-foreground sm:text-base">{formatBRL(t.value)}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{t.label}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={<Wallet className="h-7 w-7" />}
          title="Nenhum gasto registrado"
          description="Registre combustível, seguro, IPVA e outros gastos para ver os totais aqui. Ex.: R$ 300 de combustível neste mês."
          action={
            <Link to="/gastos/novo">
              <Button className="rounded-xl">Registrar gasto</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {groups.map(([month, items]) => (
            <div key={month}>
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{month}</h2>
              <div className="space-y-3">
                {items.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 rounded-3xl border border-border bg-card p-4 shadow-card">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-lg">
                      {EXPENSE_ICONS[e.categoria] ?? "💳"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold capitalize text-foreground">{e.categoria}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(e.data)}</p>
                      {e.observacoes && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground/80">{e.observacoes}</p>
                      )}
                    </div>
                    <p className="shrink-0 text-sm font-bold text-foreground">{formatBRL(Number(e.valor))}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
