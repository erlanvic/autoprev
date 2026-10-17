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
import { MAINTENANCE_ICONS, MAINTENANCE_TYPES, todayISO, vehicleLabel } from "@/lib/autoprev";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/manutencoes/nova")({
  validateSearch: (search: Record<string, unknown>) =>
    typeof search["tipo"] === "string" ? { tipo: search["tipo"] } : {},
  head: () => ({
    meta: [
      { title: "Nova manutenção — AutoPrev" },
      { name: "description", content: "Registre uma manutenção preventiva do seu veículo." },
      { property: "og:title", content: "Nova manutenção — AutoPrev" },
      { property: "og:description", content: "Registre uma manutenção preventiva do seu veículo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewMaintenancePage,
});

function NewMaintenancePage() {
  const { tipo: initialTipo } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: vehicles } = useVehicles();
  const active = useActiveVehicle(vehicles);

  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [tipo, setTipo] = useState(
    initialTipo && (MAINTENANCE_TYPES as readonly string[]).includes(initialTipo) ? initialTipo : "troca de óleo",
  );
  const [data, setData] = useState(todayISO());
  const [km, setKm] = useState("");
  const [valor, setValor] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedVehicleId = vehicleId ?? active?.id;
  const selectedVehicle = vehicles?.find((v) => v.id === selectedVehicleId);
  const kmValue = km || (selectedVehicle ? String(selectedVehicle.km_atual) : "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVehicle) return;
    setSaving(true);
    const kmNumber = Number(kmValue) || 0;
    const { error } = await supabase.from("maintenances").insert({
      vehicle_id: selectedVehicle.id,
      tipo,
      data,
      km: kmNumber,
      valor: Number(valor) || 0,
      observacoes: observacoes || null,
    });
    if (error) {
      setSaving(false);
      toast.error("Não foi possível registrar a manutenção.");
      return;
    }
    // Atualiza o km do veículo quando a manutenção é mais recente
    if (kmNumber > selectedVehicle.km_atual) {
      await supabase.from("vehicles").update({ km_atual: kmNumber }).eq("id", selectedVehicle.id);
    }
    await queryClient.invalidateQueries();
    setSaving(false);
    toast.success("Manutenção registrada!");
    navigate({ to: "/historico" });
  }

  const field = "h-12 rounded-xl";

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Nova manutenção</h1>
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
          <Label>Tipo de manutenção</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger className={field}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {MAINTENANCE_TYPES.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">
                  {MAINTENANCE_ICONS[t]} {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="m-data">Data</Label>
            <Input id="m-data" type="date" required value={data} onChange={(e) => setData(e.target.value)} className={field} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-km">Km</Label>
            <Input id="m-km" type="number" min={0} required value={kmValue} onChange={(e) => setKm(e.target.value)} className={field} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="m-valor">Valor (R$)</Label>
          <Input id="m-valor" type="number" min={0} step="0.01" required placeholder="250,00" value={valor} onChange={(e) => setValor(e.target.value)} className={field} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="m-obs">Observações (opcional)</Label>
          <Textarea id="m-obs" placeholder="Ex.: óleo sintético 5W30" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="rounded-xl" />
        </div>

        <Button type="submit" disabled={saving || !selectedVehicle} className="h-12 w-full rounded-xl font-semibold">
          {saving ? "Salvando..." : "Registrar manutenção"}
        </Button>
      </form>
    </div>
  );
}
