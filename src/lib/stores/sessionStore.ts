import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { InterviewProgress, InterviewQuestion, Patient, StructuredSummary, TriageAlert } from "@/types/api";

interface SessionState {
  patientId: string | null;
  interviewId: string | null;
  language: Patient["language"];
  mode: StructuredSummary["mode"];
  currentQuestion: InterviewQuestion | null;
  progress: InterviewProgress | null;
  priority: "normal" | "urgent";
  departmentId: string | null;
  returning: boolean;
  alert: TriageAlert | null;
  summaryId: string | null;
  patientDraft: { name?: string; phone?: string; chiefComplaint?: string } | null;
  doctorSession: boolean;
  setPatientId: (patientId: string) => void;
  setInterview: (interviewId: string, question: InterviewQuestion) => void;
  setLanguage: (language: Patient["language"]) => void;
  setMode: (mode: StructuredSummary["mode"]) => void;
  setQuestion: (currentQuestion: InterviewQuestion | null) => void;
  setProgress: (progress: InterviewProgress) => void;
  setPriority: (priority: "normal" | "urgent") => void;
  setDepartmentId: (departmentId: string | null) => void;
  setReturning: (returning: boolean) => void;
  setAlert: (alert: TriageAlert | null) => void;
  setSummaryId: (summaryId: string) => void;
  setPatientDraft: (patientDraft: { name?: string; phone?: string; chiefComplaint?: string } | null) => void;
  setDoctorSession: (doctorSession: boolean) => void;
  reset: () => void;
}

const emptySession = () => ({
  patientId: null,
  interviewId: null,
  language: "en" as const,
  mode: "general" as const,
  priority: "normal" as const,
  departmentId: null,
  returning: false,
  alert: null,
  summaryId: null,
  patientDraft: null,
  doctorSession: false,
  currentQuestion: null,
  progress: null,
});

export const useSessionStore = create<SessionState>()(persist((set) => ({
  ...emptySession(),
  setInterview: (interviewId, currentQuestion) => set({ interviewId, currentQuestion }),
  setLanguage: (language) => set({ language }),
  setPatientId: (patientId) => set({ patientId }),
  setMode: (mode) => set({ mode }),
  setQuestion: (currentQuestion) => set({ currentQuestion }),
  setProgress: (progress) => set({ progress }),
  setPriority: (priority) => set({ priority }),
  setDepartmentId: (departmentId) => set({ departmentId }),
  setReturning: (returning) => set({ returning }),
  setAlert: (alert) => set({ alert }),
  setSummaryId: (summaryId) => set({ summaryId }),
  setPatientDraft: (patientDraft) => set({ patientDraft }),
  setDoctorSession: (doctorSession) => set({ doctorSession }),
  reset: () => set(emptySession()),
}), {
  name: "medikiosk-session",
  storage: createJSONStorage(() => sessionStorage),
  partialize: (state) => ({ patientId: state.patientId, interviewId: state.interviewId, language: state.language, mode: state.mode, priority: state.priority, departmentId: state.departmentId, currentQuestion: state.currentQuestion, progress: state.progress, summaryId: state.summaryId, patientDraft: state.patientDraft, doctorSession: state.doctorSession }),
}));
