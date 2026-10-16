import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { VehicleForm, type VehicleFormValues } from "@/components/app/vehicle-form";
import { setActiveVehicleId } from "@/lib/active-vehicle";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/veiculos_/novo")({
  head: () => ({
    meta: [
      { title: "Novo veículo — AutoPrev" },
      { name: "description", content: "Cadastre um novo veículo no AutoPrev." },
      { property: "og:title", content: "Novo veículo — AutoPrev" },
      { property: "og:description", content: "Cadastre um novo veículo no AutoPrev." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewVehiclePage,
});

function NewVehiclePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(values: VehicleFormValues) {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }
    const { data, error } = await supabase
      .from("vehicles")
      .insert({
        user_id: user.id,
        marca: values.marca,
        modelo: values.modelo,
        ano: Number(values.ano),
        km_atual: Number(values.km_atual) || 0,
        placa: values.placa || null,
        apelido: values.apelido || null,
      })
      .select()
      .single();
    setSaving(false);
    if (error) {
      toast.error("Não foi possível cadastrar o veículo.");
      return;
    }
    setActiveVehicleId(data.id);
    await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    toast.success("Veículo cadastrado!");
    navigate({ to: "/veiculos" });
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Novo veículo</h1>
      <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
        <VehicleForm submitLabel="Cadastrar veículo" saving={saving} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
