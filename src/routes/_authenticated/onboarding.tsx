import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Car, Check, Gauge, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setActiveVehicleId } from "@/lib/active-vehicle";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Primeiros passos — AutoPrev" },
      { name: "description", content: "Configure sua conta e cadastre seu primeiro veículo no AutoPrev." },
      { property: "og:title", content: "Primeiros passos — AutoPrev" },
      { property: "og:description", content: "Configure sua conta e cadastre seu primeiro veículo no AutoPrev." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OnboardingPage,
});

const STEPS = [
  { icon: User, title: "Seus dados" },
  { icon: Car, title: "Seu veículo" },
  { icon: ShieldCheck, title: "Tudo pronto" },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [nome, setNome] = useState("");
  const [kmMedio, setKmMedio] = useState("1000");
  const [veiculo, setVeiculo] = useState({ marca: "", modelo: "", ano: "", km: "", placa: "", apelido: "" });

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ nome, km_medio_mensal: Number(kmMedio) || 1000 })
        .eq("id", user.id);
      if (error) {
        toast.error("Não foi possível salvar seus dados.");
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    setStep(1);
  }

  async function saveVehicle(e: React.FormEvent) {
    e.preventDefault();
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
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        ano: Number(veiculo.ano),
        km_atual: Number(veiculo.km) || 0,
        placa: veiculo.placa || null,
        apelido: veiculo.apelido || null,
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
    setStep(2);
  }

  const field =
    "h-12 rounded-xl";

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center py-6">
      <div className="w-full max-w-sm animate-fade-up">
        {/* progress */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  i < step
                    ? "bg-success text-success-foreground"
                    : i === step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              {i < STEPS.length - 1 && <span className="h-0.5 w-8 rounded bg-border" />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <form onSubmit={saveProfile} className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <User className="h-6 w-6" />
            </span>
            <h1 className="mt-4 text-xl font-bold text-foreground">Bem-vindo ao AutoPrev!</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Vamos começar com seus dados para calcular suas previsões de manutenção.
            </p>
            <div className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="ob-nome">Como podemos te chamar?</Label>
                <Input id="ob-nome" value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Seu nome" className={field} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ob-km">Quantos km você roda por mês, em média?</Label>
                <Input id="ob-km" type="number" min={0} value={kmMedio} onChange={(e) => setKmMedio(e.target.value)} required className={field} />
                <p className="text-xs text-muted-foreground">Usamos isso para prever as próximas manutenções.</p>
              </div>
            </div>
            <Button type="submit" disabled={saving} className="mt-6 h-12 w-full rounded-xl font-semibold">
              Continuar
            </Button>
          </form>
        )}

        {step === 1 && (
          <form onSubmit={saveVehicle} className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Car className="h-6 w-6" />
            </span>
            <h1 className="mt-4 text-xl font-bold text-foreground">Cadastre seu veículo</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Você pode adicionar outros veículos depois.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ob-marca">Marca</Label>
                <Input id="ob-marca" required placeholder="Fiat" value={veiculo.marca} onChange={(e) => setVeiculo({ ...veiculo, marca: e.target.value })} className={field} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ob-modelo">Modelo</Label>
                <Input id="ob-modelo" required placeholder="Argo" value={veiculo.modelo} onChange={(e) => setVeiculo({ ...veiculo, modelo: e.target.value })} className={field} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ob-ano">Ano</Label>
                <Input id="ob-ano" type="number" min={1950} max={2100} required placeholder="2021" value={veiculo.ano} onChange={(e) => setVeiculo({ ...veiculo, ano: e.target.value })} className={field} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ob-km-atual">Km atual</Label>
                <Input id="ob-km-atual" type="number" min={0} required placeholder="45000" value={veiculo.km} onChange={(e) => setVeiculo({ ...veiculo, km: e.target.value })} className={field} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ob-placa">Placa (opcional)</Label>
                <Input id="ob-placa" placeholder="ABC1D23" value={veiculo.placa} onChange={(e) => setVeiculo({ ...veiculo, placa: e.target.value })} className={field} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ob-apelido">Apelido (opcional)</Label>
                <Input id="ob-apelido" placeholder="Carro do dia a dia" value={veiculo.apelido} onChange={(e) => setVeiculo({ ...veiculo, apelido: e.target.value })} className={field} />
              </div>
            </div>
            <Button type="submit" disabled={saving} className="mt-6 h-12 w-full rounded-xl font-semibold">
              Cadastrar veículo
            </Button>
          </form>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center rounded-3xl border border-border bg-card p-8 text-center shadow-card">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
              <Gauge className="h-8 w-8" />
            </span>
            <h1 className="mt-4 text-xl font-bold text-foreground">Tudo pronto, {nome || "motorista"}!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Agora registre suas manutenções e o AutoPrev avisa antes que problemas caros
              aconteçam — mostrando quanto você economiza.
            </p>
            <Button onClick={() => navigate({ to: "/" })} className="mt-6 h-12 w-full rounded-xl font-semibold">
              Começar a economizar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
