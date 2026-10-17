import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { LogOut, Monitor, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useProfile } from "@/hooks/use-vehicles";
import { applyTheme, useTheme, type Theme } from "@/lib/active-vehicle";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil — AutoPrev" },
      { name: "description", content: "Seus dados, preferências e configurações no AutoPrev." },
      { property: "og:title", content: "Perfil — AutoPrev" },
      { property: "og:description", content: "Seus dados, preferências e configurações no AutoPrev." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useProfile();
  const theme = useTheme();

  const [nome, setNome] = useState("");
  const [kmMedio, setKmMedio] = useState("1000");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.profile) {
      setNome(data.profile.nome ?? "");
      setKmMedio(String(data.profile.km_medio_mensal));
    }
  }, [data]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ nome, km_medio_mensal: Number(kmMedio) || 1000 })
      .eq("id", data.profile.id);
    setSaving(false);
    if (error) {
      toast.error("Não foi possível salvar o perfil.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Perfil atualizado!");
  }

  function handleTheme(value: string) {
    if (!value) return;
    const t = value as Theme;
    applyTheme(t);
    window.dispatchEvent(new Event("autoprev-theme-change"));
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const initial = (data?.profile.nome || data?.email || "A").charAt(0).toUpperCase();

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Perfil</h1>

      <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-card">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-extrabold text-primary-foreground">
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-foreground">{data?.profile.nome || "Motorista"}</p>
          <p className="truncate text-sm text-muted-foreground">{data?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-bold text-foreground">Seus dados</h2>
        <div className="space-y-1.5">
          <Label htmlFor="p-nome">Nome</Label>
          <Input id="p-nome" value={nome} onChange={(e) => setNome(e.target.value)} disabled={isLoading} className="h-12 rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-km">Km médio por mês</Label>
          <Input id="p-km" type="number" min={0} value={kmMedio} onChange={(e) => setKmMedio(e.target.value)} disabled={isLoading} className="h-12 rounded-xl" />
          <p className="text-xs text-muted-foreground">Usado para prever as próximas manutenções.</p>
        </div>
        <Button type="submit" disabled={saving || isLoading} className="h-12 w-full rounded-xl font-semibold">
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-bold text-foreground">Aparência</h2>
        <ToggleGroup
          type="single"
          value={theme}
          onValueChange={handleTheme}
          className="mt-3 grid w-full grid-cols-3 gap-2"
        >
          <ToggleGroupItem value="light" className="h-11 gap-2 rounded-xl data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            <Sun className="h-4 w-4" /> Claro
          </ToggleGroupItem>
          <ToggleGroupItem value="dark" className="h-11 gap-2 rounded-xl data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            <Moon className="h-4 w-4" /> Escuro
          </ToggleGroupItem>
          <ToggleGroupItem value="system" className="h-11 gap-2 rounded-xl data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            <Monitor className="h-4 w-4" /> Sistema
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <Button
        variant="outline"
        onClick={handleSignOut}
        className="h-12 w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="mr-2 h-4 w-4" /> Sair da conta
      </Button>
    </div>
  );
}
