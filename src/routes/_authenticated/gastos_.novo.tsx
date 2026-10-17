import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useActiveVehicle, useVehicles } from "@/hooks/use-vehicles";
import { EXPENSE_CATEGORIES, EXPENSE_ICONS, todayISO, vehicleLabel } from "@/lib/autoprev";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/gastos_/novo")({
  head: () => ({
    meta: [
      { title: "Novo gasto — AutoPrev" },
      { name: "description", content: "Registre um gasto do seu veículo por categoria." },
      { property: "og:title", content: "Novo gasto — AutoPrev" },
      { property: "og:description", content: "Registre um gasto do seu veículo por categoria." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewExpensePage,
});

function NewExpensePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: vehicles } = useVehicles();
  const active = useActiveVehicle(vehicles);

  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [categoria, setCategoria] = useState<string>("combustível");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(todayISO());
  const [observacoes, setObservacoes] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedVehicleId = vehicleId ?? active?.id;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVehicleId) return;
    setSaving(true);
    const { error } = await supabase.from("expenses").insert({
      vehicle_id: selectedVehicleId,
      categoria,
      valor: Number(valor) || 0,
      data,
      observacoes: observacoes || null,
    });
    setSaving(false);
    if (error) {
      toast.error("Não foi possível registrar o gasto.");
      return;
    }
    await queryClient.invalidateQueries();
    toast.success("Gasto registrado!");
    navigate({ to: "/gastos" });
  }

  const field = "h-12 rounded-xl";

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Novo gasto</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-card">
        <div className="space-y-1.5">
          <Label>Veículo</Label>
          <Select value={selectedVehicleId ?? ""} onValueChange={setVehicleId}>
            <SelectTrigger className={field}>
              <SelectValue placeholder="Selecione o veículo" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {vehicles?.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {vehicleLabel(v)} · {v.marca} {v.modelo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Categoria</Label>
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger className={field}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {EXPENSE_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} className="capitalize">
                  {EXPENSE_ICONS[c]} {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="g-valor">Valor (R$)</Label>
            <Input id="g-valor" type="number" min={0} step="0.01" required placeholder="300,00" value={valor} onChange={(e) => setValor(e.target.value)} className={field} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="g-data">Data</Label>
            <Input id="g-data" type="date" required value={data} onChange={(e) => setData(e.target.value)} className={field} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="g-obs">Observações (opcional)</Label>
          <Textarea id="g-obs" placeholder="Ex.: etanol no posto da BR" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="rounded-xl" />
        </div>

        <Button type="submit" disabled={saving || !selectedVehicleId} className="h-12 w-full rounded-xl font-semibold">
          {saving ? "Salvando..." : "Registrar gasto"}
        </Button>
      </form>
    </div>
  );
}
