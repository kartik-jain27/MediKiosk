import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { RegisteredPatient } from "@/types/rbac";

interface PatientRegistryState {
  patients: RegisteredPatient[];
  addPatient: (patient: RegisteredPatient) => void;
  recordIntake: (medikioskId: string, intakeId: string, priority: RegisteredPatient["priority"]) => void;
}

export const usePatientRegistryStore = create<PatientRegistryState>()(persist((set) => ({
  patients: [],
  addPatient: (patient) => set((state) => ({ patients: [...state.patients.filter((item) => item.medikioskId !== patient.medikioskId), patient] })),
  recordIntake: (medikioskId, intakeId, priority) => set((state) => ({ patients: state.patients.map((patient) => patient.medikioskId === medikioskId ? { ...patient, latestIntakeId: intakeId, priority } : patient) })),
}), { name: "medikiosk-patient-registry", storage: createJSONStorage(() => localStorage) }));
