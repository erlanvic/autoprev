import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getActiveVehicleId, setActiveVehicleId, useActiveVehicleId } from "@/lib/active-vehicle";
import type { Vehicle } from "@/lib/autoprev";

export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicles").select("*").order("created_at");
      if (error) throw error;
      return data as Vehicle[];
    },
  });
}

export function useActiveVehicle(vehicles: Vehicle[] | undefined) {
  const activeId = useActiveVehicleId();
  const first = vehicles?.[0];
  if (!first) return null;
  const found = vehicles.find((v) => v.id === activeId);
  if (found) return found;
  // persist the fallback so the rest of the app agrees
  if (getActiveVehicleId() !== first.id) setActiveVehicleId(first.id);
  return first;
}

export function useMaintenances(vehicleId: string | undefined) {
  return useQuery({
    queryKey: ["maintenances", vehicleId],
    enabled: !!vehicleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenances")
        .select("*")
        .eq("vehicle_id", vehicleId!)
        .order("data", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useMaintenanceRules() {
  return useQuery({
    queryKey: ["maintenance_rules"],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase.from("maintenance_rules").select("*");
      if (error) throw error;
      return data;
    },
  });
}

export function useExpenses(vehicleId: string | undefined) {
  return useQuery({
    queryKey: ["expenses", vehicleId],
    enabled: !!vehicleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("vehicle_id", vehicleId!)
        .order("data", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (error) throw error;
      return { profile: data, email: user.email ?? "" };
    },
  });
}
