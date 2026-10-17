import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { BarChart3, Car, Home, Plus, User, Wallet, Wrench, Receipt } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/", label: "Início", icon: Home },
  { to: "/veiculos", label: "Veículos", icon: Car },
  { to: "/gastos", label: "Gastos", icon: Wallet },
  { to: "/estatisticas", label: "Estatísticas", icon: BarChart3 },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <>
      {/* Floating action button */}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 mx-auto flex max-w-lg justify-end px-5">
        <Popover>
          <PopoverTrigger asChild>
            <button
              aria-label="Adicionar"
              className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-fab transition-transform hover:scale-105 active:scale-95"
            >
              <Plus className="h-6 w-6" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="end" className="w-56 rounded-2xl p-2 shadow-card">
            <button
              onClick={() => navigate({ to: "/manutencoes/nova", search: {} })}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Wrench className="h-4 w-4" />
              </span>
              Nova manutenção
            </button>
            <button
              onClick={() => navigate({ to: "/gastos/novo" })}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-success/10 text-success">
                <Receipt className="h-4 w-4" />
              </span>
              Novo gasto
            </button>
          </PopoverContent>
        </Popover>
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-nav backdrop-blur">
        <div className="mx-auto flex max-w-lg items-stretch justify-between px-2">
          {TABS.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "scale-110")} strokeWidth={active ? 2.4 : 2} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
