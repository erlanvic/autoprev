import { useNavigate } from "@tanstack/react-router";
import { Car, Check, ChevronDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setActiveVehicleId, useActiveVehicleId } from "@/lib/active-vehicle";
import { vehicleLabel, type Vehicle } from "@/lib/autoprev";

export function VehicleSelector({ vehicles, active }: { vehicles: Vehicle[]; active: Vehicle | null }) {
  const navigate = useNavigate();
  const activeId = useActiveVehicleId();

  if (!active) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-2 pr-3 shadow-card transition-colors hover:bg-accent">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Car className="h-4 w-4" />
          </span>
          <span className="max-w-28 truncate text-sm font-semibold text-foreground">
            {vehicleLabel(active)}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-card">
        {vehicles.map((v) => (
          <DropdownMenuItem
            key={v.id}
            onClick={() => setActiveVehicleId(v.id)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Car className="h-4 w-4" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium text-foreground">{vehicleLabel(v)}</span>
              <span className="block text-xs text-muted-foreground">
                {v.marca} {v.modelo} · {v.ano}
              </span>
            </span>
            {(activeId ?? active.id) === v.id && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate({ to: "/veiculos/novo" })}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10 text-success">
            <Plus className="h-4 w-4" />
          </span>
          <span className="text-sm font-medium text-foreground">Adicionar veículo</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
