import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { History } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVehicles } from "@/hooks/use-vehicles";
import { formatBRL, formatDate, formatKm, MAINTENANCE_ICONS, MAINTENANCE_TYPES, vehicleLabel, type Maintenance } from "@/lib/autoprev";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/historico")({
  head: () => ({
    meta: [
      { title: "Histórico de manutenções — AutoPrev" },
      { name: "description", content: "Timeline de todas as manutenções registradas nos seus veículos." },
      { property: "og:title", content: "Histórico de manutenções — AutoPrev" },
      { property: "og:description", content: "Timeline de todas as manutenções registradas nos seus veículos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { data: vehicles } = useVehicles();
  const [tipoFilter, setTipoFilter] = useState("todos");
  const [vehicleFilter, setVehicleFilter] = useState("todos");

  const vehicleIds = useMemo(() => (vehicles ?? []).map((v) => v.id), [vehicles]);

  const maintenancesQuery = useQuery({
    queryKey: ["all-maintenances", vehicleIds],
    enabled: vehicleIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenances")
        .select("*")
        .in("vehicle_id", vehicleIds)
        .order("data", { ascending: false })
        .order("km", { ascending: false });
      if (error) throw error;
      return data as Maintenance[];
    },
  });

  const filtered = (maintenancesQuery.data ?? []).filter(
    (m) =>
      (tipoFilter === "todos" || m.tipo === tipoFilter) &&
      (vehicleFilter === "todos" || m.vehicle_id === vehicleFilter),
  );

  const groups = useMemo(() => {
    const map = new Map<string, Maintenance[]>();
    for (const m of filtered) {
      const [y, mo] = m.data.slice(0, 7).split("-").map(Number);
      const key = new Date(y, mo - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      map.set(key, [...(map.get(key) ?? []), m]);
    }
    return [...map.entries()];
  }, [filtered]);

  const vehicleById = useMemo(() => new Map((vehicles ?? []).map((v) => [v.id, v])), [vehicles]);

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Histórico</h1>

      <div className="grid grid-cols-2 gap-3">
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="h-11 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="todos">Todos os tipos</SelectItem>
            {MAINTENANCE_TYPES.map((t) => (
              <SelectItem key={t} value={t} className="capitalize">
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
          <SelectTrigger className="h-11 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="todos">Todos os veículos</SelectItem>
            {vehicles?.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {vehicleLabel(v)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {maintenancesQuery.isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={<History className="h-7 w-7" />}
          title="Nenhuma manutenção registrada"
          description="Registre sua primeira manutenção pelo botão + e acompanhe a timeline aqui. Ex.: troca de óleo aos 45.000 km por R$ 250."
        />
      ) : (
        <div className="space-y-6">
          {groups.map(([month, items]) => (
            <div key={month}>
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{month}</h2>
              <div className="relative space-y-3 border-l-2 border-border pl-4">
                {items.map((m) => (
                  <div key={m.id} className="relative rounded-3xl border border-border bg-card p-4 shadow-card">
                    <span className="absolute -left-[23px] top-5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-lg">
                        {MAINTENANCE_ICONS[m.tipo] ?? "🧰"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold capitalize text-foreground">{m.tipo}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(m.data)} · {formatKm(m.km)} · {vehicleById.get(m.vehicle_id) ? vehicleLabel(vehicleById.get(m.vehicle_id)!) : ""}
                        </p>
                        {m.observacoes && (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground/80">{m.observacoes}</p>
                        )}
                      </div>
                      <p className="shrink-0 text-sm font-bold text-foreground">{formatBRL(Number(m.valor))}</p>
                    </div>
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
