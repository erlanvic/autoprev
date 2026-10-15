import { createFileRoute, Navigate, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { BottomNav } from "@/components/app/bottom-nav";
import { VehicleSelector } from "@/components/app/vehicle-selector";
import { useActiveVehicle, useVehicles } from "@/hooks/use-vehicles";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { pathname } = useLocation();
  const vehiclesQuery = useVehicles();
  const vehicles = vehiclesQuery.data;
  const active = useActiveVehicle(vehicles);
  const isOnboarding = pathname === "/onboarding";

  if (!isOnboarding && vehicles && vehicles.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {!isOnboarding && (
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <ShieldCheck className="h-4.5 w-4.5" />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-foreground">AutoPrev</span>
            </div>
            {vehicles && <VehicleSelector vehicles={vehicles} active={active} />}
          </div>
        </header>
      )}

      <main className="mx-auto w-full max-w-lg px-4 pb-32 pt-5">
        <Outlet />
      </main>

      {!isOnboarding && <BottomNav />}
    </div>
  );
}
