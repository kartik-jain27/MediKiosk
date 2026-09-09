import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { DoctorProfile, StaffProfile } from "@/types/rbac";

interface DirectoryState {
  doctors: DoctorProfile[];
  staff: StaffProfile[];
  addDoctor: (doctor: DoctorProfile) => void;
  addStaff: (staffMember: StaffProfile) => void;
  updateStaff: (staffMember: StaffProfile) => void;
  searchDoctors: (query: string) => DoctorProfile[];
}

export const useDirectoryStore = create<DirectoryState>()(persist((set, get) => ({
  doctors: [],
  staff: [],
  addDoctor: (doctor) => set((state) => ({ doctors: [...state.doctors.filter((item) => item.email !== doctor.email), doctor] })),
  addStaff: (staffMember) => set((state) => ({ staff: [...state.staff.filter((item) => item.email !== staffMember.email), staffMember] })),
  updateStaff: (staffMember) => set((state) => ({ staff: state.staff.map((item) => item.staffId === staffMember.staffId ? staffMember : item) })),
  searchDoctors: (query) => {
    const term = query.trim().toLowerCase();
    return !term ? get().doctors : get().doctors.filter((doctor) => [doctor.name, doctor.doctorId].some((value) => value.toLowerCase().includes(term)));
  },
}), { name: "medikiosk-directory", storage: createJSONStorage(() => localStorage) }));
