import { createFileRoute, Link } from "@tanstack/react-router";
import { Car, Check, ChevronRight, Plus } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { useActiveVehicle, useVehicles } from "@/hooks/use-vehicles";
import { setActiveVehicleId } from "@/lib/active-vehicle";
import { formatKm, vehicleLabel } from "@/lib/autoprev";

export const Route = createFileRoute("/_authenticated/veiculos")({
  head: () => ({
    meta: [
      { title: "Meus veículos — AutoPrev" },
      { name: "description", content: "Gerencie os veículos cadastrados no AutoPrev." },
      { property: "og:title", content: "Meus veículos — AutoPrev" },
      { property: "og:description", content: "Gerencie os veículos cadastrados no AutoPrev." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VehiclesPage,
});

function VehiclesPage() {
  const { data: vehicles, isLoading } = useVehicles();
  const active = useActiveVehicle(vehicles);

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Meus veículos</h1>
        <Link to="/veiculos/novo">
          <Button size="sm" className="rounded-xl">
            <Plus className="mr-1 h-4 w-4" /> Novo
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
      ) : !vehicles || vehicles.length === 0 ? (
        <EmptyState
          icon={<Car className="h-7 w-7" />}
          title="Nenhum veículo cadastrado"
          description="Cadastre seu primeiro veículo para acompanhar manutenções e gastos."
          action={
            <Link to="/veiculos/novo">
              <Button className="rounded-xl">Cadastrar veículo</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {vehicles.map((v) => {
            const isActive = active?.id === v.id;
            return (
              <div
                key={v.id}
                className={`rounded-3xl border bg-card p-4 shadow-card transition-colors ${
                  isActive ? "border-primary/40" : "border-border"
                }`}
              >
                <button
                  onClick={() => setActiveVehicleId(v.id)}
                  className="flex w-full items-center gap-3 text-left"
                >
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                      isActive ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Car className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-base font-bold text-foreground">{vehicleLabel(v)}</span>
                      {isActive && (
                        <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                          <Check className="h-3 w-3" /> ativo
                        </span>
                      )}
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      {v.marca} {v.modelo} · {v.ano}
                      {v.placa ? ` · ${v.placa}` : ""}
                    </span>
                    <span className="block text-xs text-muted-foreground">{formatKm(v.km_atual)}</span>
                  </span>
                </button>
                <Link
                  to="/veiculos/$vehicleId/editar"
                  params={{ vehicleId: v.id }}
                  className="mt-3 flex items-center justify-end gap-1 text-xs font-semibold text-primary"
                >
                  Editar <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
