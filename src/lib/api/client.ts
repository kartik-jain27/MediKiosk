import axios from "axios";
import type {
  Consent,
  DoctorQueueEntry,
  InterviewAnswerResponse,
  InterviewQuestion,
  InterviewStartResponse,
  Patient,
  StructuredSummary,
  TimelineEntry,
  TriageAlert,
} from "@/types/api";
import type { StaffAssignmentCandidate } from "@/types/rbac";

const client = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api" });
const data = <T>(request: Promise<{ data: T }>) => request.then((response) => response.data);

export const api = {
  createPatient: (body: Pick<Patient, "name" | "phone" | "language">) => data(client.post<Patient>("/patients", body)),
  getPatient: (id: string) => data(client.get<Patient>(`/patients/${id}`)),
  grantConsent: (patientId: string, body: Pick<Consent, "type">) => data(client.post<Consent>(`/patients/${patientId}/consent`, body)),
  revokeConsent: (id: string) => data(client.patch<Consent>(`/consent/${id}/revoke`)),
  startInterview: (body: { patientId: string; mode: StructuredSummary["mode"] }) => data(client.post<InterviewStartResponse>("/interviews", body)),
  getNextQuestion: (id: string) => data(client.get<InterviewQuestion | null>(`/interviews/${id}/next-question`)),
  answerInterview: (id: string, body: { questionId: string; answer: string }) => data(client.post<InterviewAnswerResponse>(`/interviews/${id}/answer`, body)),
  getTriageAlerts: () => data(client.get<TriageAlert[]>("/triage/alerts")),
  acknowledgeTriageAlert: (id: string) => data(client.post<TriageAlert>(`/triage/alerts/${id}/acknowledge`)),
  uploadDocument: (file: File) => {
    const body = new FormData();
    body.append("file", file);
    return data(client.post<{ documentId: string; status: "processing" }>("/documents/upload", body));
  },
  getDocumentStatus: (id: string) => data(client.get<{ status: "processing" | "done"; extractedData?: object }>(`/documents/${id}/status`)),
  getTimeline: (id: string) => data(client.get<TimelineEntry[]>(`/patients/${id}/timeline`)),
  generateSummary: (body: { patientId: string; interviewId: string }) => data(client.post<StructuredSummary>("/summaries/generate", body)),
  createManualSummary: (body: { patientId: string; chiefComplaint: string }) => data(client.post<StructuredSummary>("/summaries/manual", body)),
  getStaffAssignmentCandidates: () => data(client.get<StaffAssignmentCandidate[]>("/staff/assignments")),
  getDoctorSummary: (patientId: string) => data(client.get<StructuredSummary>(`/doctor/patients/${patientId}/summary`)),
  getDoctorQueue: () => data(client.get<DoctorQueueEntry[]>("/doctor/queue")),
  updateSummary: (id: string, body: { section: string; content: string }) => data(client.patch<StructuredSummary>(`/summary/${id}`, body)),
  approveSummary: (id: string) => data(client.post<StructuredSummary>(`/summary/${id}/approve`)),
};
