import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { VehicleForm, type VehicleFormValues } from "@/components/app/vehicle-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useVehicles } from "@/hooks/use-vehicles";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/veiculos_/$vehicleId/editar")({
  head: () => ({
    meta: [
      { title: "Editar veículo — AutoPrev" },
      { name: "description", content: "Edite os dados do seu veículo no AutoPrev." },
      { property: "og:title", content: "Editar veículo — AutoPrev" },
      { property: "og:description", content: "Edite os dados do seu veículo no AutoPrev." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EditVehiclePage,
});

function EditVehiclePage() {
  const { vehicleId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: vehicles, isLoading } = useVehicles();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const vehicle = vehicles?.find((v) => v.id === vehicleId);

  async function handleSubmit(values: VehicleFormValues) {
    setSaving(true);
    const { error } = await supabase
      .from("vehicles")
      .update({
        marca: values.marca,
        modelo: values.modelo,
        ano: Number(values.ano),
        km_atual: Number(values.km_atual) || 0,
        placa: values.placa || null,
        apelido: values.apelido || null,
      })
      .eq("id", vehicleId);
    setSaving(false);
    if (error) {
      toast.error("Não foi possível salvar as alterações.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    toast.success("Veículo atualizado!");
    navigate({ to: "/veiculos" });
  }

  async function handleDelete() {
    setDeleting(true);
    const { error } = await supabase.from("vehicles").delete().eq("id", vehicleId);
    setDeleting(false);
    if (error) {
      toast.error("Não foi possível remover o veículo.");
      return;
    }
    await queryClient.invalidateQueries();
    toast.success("Veículo removido.");
    navigate({ to: "/veiculos" });
  }

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-3xl bg-muted" />;
  }

  if (!vehicle) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-card">
        <p className="text-sm text-muted-foreground">Veículo não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Editar veículo</h1>
      <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
        <VehicleForm initial={vehicle} submitLabel="Salvar alterações" saving={saving} onSubmit={handleSubmit} />
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="h-12 w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive">
            Remover veículo
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover veículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso remove também todo o histórico de manutenções e gastos deste veículo. Essa ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
