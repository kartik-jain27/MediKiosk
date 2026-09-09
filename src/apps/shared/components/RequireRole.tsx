import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/lib/stores/authStore";

export function RequireRole({ role, children }: { role: "staff" | "doctor"; children: ReactNode }) {
  const currentRole = useAuthStore((state) => state.role);
  return currentRole === role ? <>{children}</> : <Navigate to={`/${role}/login`} replace />;
}
