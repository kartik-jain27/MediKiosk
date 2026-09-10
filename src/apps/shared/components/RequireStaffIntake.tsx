import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/lib/stores/authStore";
import { useSessionStore } from "@/lib/stores/sessionStore";

export function RequireStaffIntake({ children }: { children: ReactNode }) {
  const role = useAuthStore((state) => state.role);
  const patientId = useSessionStore((state) => state.patientId);
  return role === "staff" && patientId ? <>{children}</> : <Navigate to="/staff/login" replace />;
}
