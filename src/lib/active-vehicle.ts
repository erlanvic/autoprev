import { useSyncExternalStore } from "react";

const KEY = "autoprev-active-vehicle";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function getActiveVehicleId(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setActiveVehicleId(id: string) {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // ignore
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useActiveVehicleId(): string | null {
  return useSyncExternalStore(subscribe, getActiveVehicleId, () => null);
}

// ---- theme ----

const THEME_KEY = "autoprev-theme";
export type Theme = "light" | "dark" | "system";

export function getTheme(): Theme {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === "light" || t === "dark" || t === "system") return t;
  } catch {
    // ignore
  }
  return "system";
}

export function applyTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    (l) => {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", l);
      window.addEventListener("autoprev-theme-change", l);
      return () => {
        mq.removeEventListener("change", l);
        window.removeEventListener("autoprev-theme-change", l);
      };
    },
    getTheme,
    () => "system" as Theme,
  );
}
