import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { DoctorQueueItem } from "@/types/rbac";

interface DoctorQueueState {
  items: DoctorQueueItem[];
  assignToDoctor: (doctorId: string, item: Omit<DoctorQueueItem, "doctorId">) => void;
  updateDiagnosis: (itemId: string, diagnosis: string) => void;
  markDiagnosed: (itemId: string) => void;
  getQueueForDoctor: (doctorId: string) => DoctorQueueItem[];
}

export const useDoctorQueueStore = create<DoctorQueueState>()(persist((set, get) => ({
  items: [],
  assignToDoctor: (doctorId, item) => set((state) => ({ items: [...state.items.filter((existing) => existing.id !== item.id), { ...item, doctorId }] })),
  updateDiagnosis: (itemId, diagnosis) => set((state) => ({ items: state.items.map((item) => item.id === itemId ? { ...item, diagnosis } : item) })),
  markDiagnosed: (itemId) => set((state) => ({ items: state.items.map((item) => item.id === itemId ? { ...item, status: "diagnosed" } : item) })),
  getQueueForDoctor: (doctorId) => get().items.filter((item) => item.doctorId === doctorId),
}), { name: "medikiosk-doctor-queue", storage: createJSONStorage(() => localStorage) }));
