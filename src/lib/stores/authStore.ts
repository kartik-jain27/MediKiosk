import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { DoctorProfile, StaffProfile } from "@/types/rbac";

type Role = "staff" | "doctor" | null;
type Profile = DoctorProfile | StaffProfile;

interface AuthState {
  role: Role;
  currentDoctor: DoctorProfile | null;
  currentStaff: StaffProfile | null;
  login: (role: Exclude<Role, null>, profile: Profile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(persist((set) => ({
  role: null,
  currentDoctor: null,
  currentStaff: null,
  login: (role, profile) => set(role === "doctor"
    ? { role, currentDoctor: profile as DoctorProfile, currentStaff: null }
    : { role, currentDoctor: null, currentStaff: profile as StaffProfile }),
  logout: () => set({ role: null, currentDoctor: null, currentStaff: null }),
}), { name: "medikiosk-auth", storage: createJSONStorage(() => localStorage) }));
