import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Vehicle } from "@/lib/autoprev";

export interface VehicleFormValues {
  marca: string;
  modelo: string;
  ano: string;
  km_atual: string;
  placa: string;
  apelido: string;
}

export function VehicleForm({
  initial,
  submitLabel,
  saving,
  onSubmit,
}: {
  initial?: Vehicle;
  submitLabel: string;
  saving: boolean;
  onSubmit: (values: VehicleFormValues) => void;
}) {
  const [values, setValues] = useState<VehicleFormValues>({
    marca: initial?.marca ?? "",
    modelo: initial?.modelo ?? "",
    ano: initial ? String(initial.ano) : "",
    km_atual: initial ? String(initial.km_atual) : "",
    placa: initial?.placa ?? "",
    apelido: initial?.apelido ?? "",
  });

  const field = "h-12 rounded-xl";
  const set = (key: keyof VehicleFormValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="v-marca">Marca</Label>
          <Input id="v-marca" required placeholder="Fiat" value={values.marca} onChange={set("marca")} className={field} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="v-modelo">Modelo</Label>
          <Input id="v-modelo" required placeholder="Argo" value={values.modelo} onChange={set("modelo")} className={field} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="v-ano">Ano</Label>
          <Input id="v-ano" type="number" min={1950} max={2100} required placeholder="2021" value={values.ano} onChange={set("ano")} className={field} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="v-km">Km atual</Label>
          <Input id="v-km" type="number" min={0} required placeholder="45000" value={values.km_atual} onChange={set("km_atual")} className={field} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="v-placa">Placa (opcional)</Label>
          <Input id="v-placa" placeholder="ABC1D23" value={values.placa} onChange={set("placa")} className={field} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="v-apelido">Apelido (opcional)</Label>
          <Input id="v-apelido" placeholder="Carro do dia a dia" value={values.apelido} onChange={set("apelido")} className={field} />
        </div>
      </div>
      <Button type="submit" disabled={saving} className="h-12 w-full rounded-xl font-semibold">
        {saving ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}
