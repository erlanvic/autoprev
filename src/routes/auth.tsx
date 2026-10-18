import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Entrar — AutoPrev" },
      {
        name: "description",
        content: "Entre ou crie sua conta no AutoPrev, o guardião financeiro do seu veículo.",
      },
      { property: "og:title", content: "Entrar — AutoPrev" },
      {
        property: "og:description",
        content: "Entre ou crie sua conta no AutoPrev, o guardião financeiro do seu veículo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [signedUpEmail, setSignedUpEmail] = useState<string | null>(null);

  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Não foi possível entrar com o Google.");
      setLoading(false);
      return;
    }
    if (result.redirected) return; // browser is navigating to Google
    navigate({ to: "/" });
  }

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setLoading(false);
    if (error) {
      toast.error("E-mail ou senha incorretos.");
      return;
    }
    navigate({ to: "/" });
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: String(form.get("password")),
      options: {
        data: { nome: String(form.get("nome")) },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(
        error.message.includes("already")
          ? "Este e-mail já tem uma conta."
          : error.code === "weak_password"
            ? "Essa senha é muito fraca. Escolha uma senha mais forte e menos comum."
            : "Não foi possível criar a conta.",
      );
      return;
    }
    if (!data.session) {
      setSignedUpEmail(email);
      return;
    }
    navigate({ to: "/" });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="flex flex-col items-center text-center">
          <img src="/favicon.svg" alt="AutoPrev" className="h-16 w-16 rounded-3xl shadow-fab" />
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground">AutoPrev</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            O guardião financeiro do seu veículo
          </p>
        </div>

        {signedUpEmail ? (
          <div className="mt-8 flex flex-col items-center rounded-3xl border border-border bg-card p-8 text-center shadow-card">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
              <MailCheck className="h-7 w-7" />
            </span>
            <h2 className="mt-4 text-lg font-bold text-foreground">Confirme seu e-mail</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enviamos um link de confirmação para{" "}
              <span className="font-semibold text-foreground">{signedUpEmail}</span>. Clique nele
              para ativar sua conta e depois volte aqui para entrar.
            </p>
            <Button
              variant="outline"
              className="mt-6 w-full rounded-xl"
              onClick={() => setSignedUpEmail(null)}
            >
              Voltar para o login
            </Button>
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-card">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={handleGoogle}
              className="h-12 w-full rounded-xl text-sm font-semibold"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continuar com Google
            </Button>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">ou com e-mail</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <Tabs defaultValue="entrar">
              <TabsList className="grid w-full grid-cols-2 rounded-xl">
                <TabsTrigger value="entrar" className="rounded-lg">Entrar</TabsTrigger>
                <TabsTrigger value="cadastrar" className="rounded-lg">Criar conta</TabsTrigger>
              </TabsList>

              <TabsContent value="entrar">
                <form onSubmit={handleSignIn} className="mt-4 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email">E-mail</Label>
                    <Input id="login-email" name="email" type="email" required placeholder="voce@email.com" className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input id="login-password" name="password" type="password" required minLength={6} placeholder="••••••••" className="h-12 rounded-xl" />
                  </div>
                  <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl text-sm font-semibold">
                    Entrar
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="cadastrar">
                <form onSubmit={handleSignUp} className="mt-4 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-nome">Nome</Label>
                    <Input id="signup-nome" name="nome" required placeholder="Seu nome" className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email">E-mail</Label>
                    <Input id="signup-email" name="email" type="email" required placeholder="voce@email.com" className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input id="signup-password" name="password" type="password" required minLength={6} placeholder="Mínimo 6 caracteres" className="h-12 rounded-xl" />
                  </div>
                  <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl text-sm font-semibold">
                    Criar conta
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Manutenção preventiva em dia, bolso protegido.
        </p>
      </div>
    </div>
  );
}
