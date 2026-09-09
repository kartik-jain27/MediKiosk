import { http, HttpResponse } from "msw";
import type { Consent, DoctorQueueEntry, InterviewStage, Patient, StructuredSummary, TriageAlert } from "@/types/api";
import type { StaffAssignmentCandidate } from "@/types/rbac";
import { interviewStages, isRedFlagAnswer, questionAt, summarySectionsFromAnswers } from "./flow.ts";

type MockInterview = { patientId: string; mode: StructuredSummary["mode"]; stageIndex: number; createdAt: string; answers: Partial<Record<InterviewStage, string>> };
type MockData = { patients: [string, Patient][]; interviews: [string, MockInterview][]; alerts: [string, TriageAlert][]; summaries: [string, StructuredSummary][] };

// ponytail: session storage keeps demo data across a tab reload; the real backend must own patient data.
const storage = typeof window === "undefined" ? null : window.localStorage;
const restored = (() => { try { return JSON.parse(storage?.getItem("medikiosk-mock-data") ?? "{}") as Partial<MockData>; } catch { return {}; } })();
const patients = new Map<string, Patient>(restored.patients ?? []);
const consents = new Map<string, Consent>();
const interviews = new Map<string, MockInterview>(restored.interviews ?? []);
const alerts = new Map<string, TriageAlert>(restored.alerts ?? []);
const documents = new Map<string, { checks: number; label: string }>();
const summaries = new Map<string, StructuredSummary>(restored.summaries ?? []);

const log = (endpoint: string) => console.info(`[MSW] ${endpoint}`);
const id = () => crypto.randomUUID();
const json = (body: object | null, init?: ResponseInit) => HttpResponse.json(body, init);
const save = () => storage?.setItem("medikiosk-mock-data", JSON.stringify({ patients: [...patients], interviews: [...interviews], alerts: [...alerts], summaries: [...summaries] } satisfies MockData));

const summaryFor = (patientId: string, mode: StructuredSummary["mode"] = "general", answers: Partial<Record<InterviewStage, string>> = {}): StructuredSummary => ({
  id: id(),
  patientId,
  status: "draft",
  mode,
  sections: summarySectionsFromAnswers(answers),
});

export const handlers = [
  http.post("*/api/patients", async ({ request }) => {
    log("POST /patients");
    const body = await request.json() as Pick<Patient, "name" | "phone" | "language">;
    const patient = { id: id(), ...body };
    patients.set(patient.id, patient);
    save();
    return json(patient);
  }),
  http.get("/api/patients/:id", ({ params }) => {
    log("GET /patients/:id");
    const patientId = String(params.id);
    return json(patients.get(patientId) ?? { id: patientId, name: "Demo Patient", phone: "9876543210", language: "en" });
  }),
  http.post("/api/patients/:id/consent", async ({ params, request }) => {
    log("POST /patients/:id/consent");
    const body = await request.json() as Pick<Consent, "type">;
    const consent: Consent = { id: id(), patientId: String(params.id), type: body.type, status: "granted", timestamp: new Date().toISOString() };
    consents.set(consent.id, consent);
    return json(consent);
  }),
  http.patch("/api/consent/:id/revoke", ({ params }) => {
    log("PATCH /consent/:id/revoke");
    const consent = consents.get(String(params.id));
    if (!consent) return json({ message: "Consent not found" }, { status: 404 });
    const revoked = { ...consent, status: "revoked" as const, timestamp: new Date().toISOString() };
    consents.set(revoked.id, revoked);
    return json(revoked);
  }),
  http.post("/api/interviews", async ({ request }) => {
    log("POST /interviews");
    const body = await request.json() as { patientId: string; mode: StructuredSummary["mode"] };
    const interviewId = id();
    interviews.set(interviewId, { ...body, stageIndex: 0, createdAt: new Date().toISOString(), answers: {} });
    save();
    return json({ interviewId, question: questionAt(0)! });
  }),
  http.get("/api/interviews/:id/next-question", ({ params }) => {
    log("GET /interviews/:id/next-question");
    const interview = interviews.get(String(params.id));
    return json(interview ? questionAt(interview.stageIndex) : null);
  }),
  http.post("/api/interviews/:id/answer", async ({ params, request }) => {
    log("POST /interviews/:id/answer");
    const interviewId = String(params.id);
    const interview = interviews.get(interviewId);
    if (!interview) return json({ message: "Interview not found" }, { status: 404 });
    const body = await request.json() as { questionId: string; answer: string };
    const redFlag = isRedFlagAnswer(body.answer)
      ? { id: id(), interviewId, severity: "critical" as const, message: "Possible breathing emergency. Please alert clinical staff immediately.", acknowledged: false }
      : undefined;
    if (redFlag) alerts.set(redFlag.id, redFlag);
    const stageIndex = interview.stageIndex;
    interview.answers[interviewStages[stageIndex]] = body.answer;
    interview.stageIndex = Math.min(stageIndex + 1, interviewStages.length);
    save();
    const nextQuestion = questionAt(interview.stageIndex);
    return json({
      nextQuestion,
      ...(redFlag && { redFlag }),
      progress: { stage: nextQuestion?.stage ?? interviewStages[interviewStages.length - 1], stageIndex: Math.min(interview.stageIndex + 1, interviewStages.length), totalStages: interviewStages.length },
    });
  }),
  http.get("/api/triage/alerts", () => {
    log("GET /triage/alerts");
    return json([...alerts.values()]);
  }),
  http.post("/api/triage/alerts/:id/acknowledge", ({ params }) => {
    log("POST /triage/alerts/:id/acknowledge");
    const alert = alerts.get(String(params.id));
    if (!alert) return json({ message: "Alert not found" }, { status: 404 });
    const acknowledged = { ...alert, acknowledged: true };
    alerts.set(acknowledged.id, acknowledged);
    save();
    return json(acknowledged);
  }),
  http.post("/api/documents/upload", async ({ request }) => {
    log("POST /documents/upload");
    const file = (await request.formData()).get("file");
    const documentId = id();
    documents.set(documentId, { checks: 0, label: file instanceof File ? file.name : "Uploaded document" });
    return json({ documentId, status: "processing" as const });
  }),
  http.get("/api/documents/:id/status", ({ params }) => {
    log("GET /documents/:id/status");
    const document = documents.get(String(params.id));
    if (!document) return json({ message: "Document not found" }, { status: 404 });
    document.checks += 1;
    return document.checks < 2
      ? json({ status: "processing" as const })
      : json({ status: "done" as const, extractedData: { summary: `OCR complete for ${document.label}` } });
  }),
  http.get("/api/patients/:id/timeline", ({ params }) => {
    log("GET /patients/:id/timeline");
    const interview = [...interviews.values()].find((entry) => entry.patientId === String(params.id));
    if (!interview) return json([{ date: new Date().toISOString(), label: "Intake interview started", source: "interview" as const }]);
    return json([{ date: interview.createdAt, label: "Intake interview started", source: "interview" as const }, ...Object.entries(interview.answers).map(([stage, answer]) => ({ date: interview.createdAt, label: `${stage.replace(/_/g, " ")}: ${answer}`, source: "interview" as const }))]);
  }),
  http.post("/api/summaries/generate", async ({ request }) => {
    log("POST /summaries/generate");
    const body = await request.json() as { patientId: string; interviewId: string };
    const interview = interviews.get(body.interviewId);
    const summary = summaryFor(body.patientId, interview?.mode, interview?.answers);
    summaries.set(summary.id, summary);
    save();
    return json(summary);
  }),
  http.post("/api/summaries/manual", async ({ request }) => {
    log("POST /summaries/manual");
    const body = await request.json() as { patientId: string; chiefComplaint: string };
    const summary = summaryFor(body.patientId, "general", { CHIEF_COMPLAINT: body.chiefComplaint });
    summaries.set(summary.id, summary);
    save();
    return json(summary);
  }),
  http.get("/api/staff/assignments", () => {
    log("GET /staff/assignments");
    const candidates: StaffAssignmentCandidate[] = [...summaries.values()].map((summary) => {
      const interview = [...interviews.entries()].find(([, item]) => item.patientId === summary.patientId);
      const alert = interview && [...alerts.values()].find((item) => item.interviewId === interview[0]);
      return { patientId: summary.patientId, patientName: patients.get(summary.patientId)?.name ?? "Patient", summaryId: summary.id, chiefComplaint: summary.sections.chiefComplaint, priority: alert?.severity === "critical" ? "critical" : alert ? "urgent" : "normal" };
    });
    return json(candidates);
  }),
  http.get("/api/doctor/patients/:patientId/summary", ({ params }) => {
    log("GET /doctor/patients/:patientId/summary");
    const patientId = String(params.patientId);
    const summary = [...summaries.values()].find((entry) => entry.patientId === patientId) ?? summaryFor(patientId);
    summaries.set(summary.id, summary);
    save();
    return json(summary);
  }),
  http.get("/api/doctor/queue", () => {
    log("GET /doctor/queue");
    const queue: DoctorQueueEntry[] = [...summaries.values()].filter((summary) => summary.status !== "approved").map((summary) => {
      const interview = [...interviews.entries()].find(([, entry]) => entry.patientId === summary.patientId);
      return { patientId: summary.patientId, name: patients.get(summary.patientId)?.name ?? "Demo Patient", chiefComplaint: summary.sections.chiefComplaint, mode: summary.mode, hasRedFlag: Boolean(interview && [...alerts.values()].some((alert) => alert.interviewId === interview[0])) };
    });
    return json(queue.length ? queue : [{ patientId: "demo-patient", name: "Demo Patient", chiefComplaint: "Headache and fatigue", mode: "general", hasRedFlag: false }]);
  }),
  http.patch("/api/summary/:id", async ({ params, request }) => {
    log("PATCH /summary/:id");
    const summary = summaries.get(String(params.id));
    if (!summary) return json({ message: "Summary not found" }, { status: 404 });
    const body = await request.json() as { section: keyof StructuredSummary["sections"]; content: string };
    const updated = { ...summary, status: "under_review" as const, sections: { ...summary.sections, [body.section]: body.content } };
    summaries.set(updated.id, updated);
    save();
    return json(updated);
  }),
  http.post("/api/summary/:id/approve", ({ params }) => {
    log("POST /summary/:id/approve");
    const summary = summaries.get(String(params.id));
    if (!summary) return json({ message: "Summary not found" }, { status: 404 });
    const approved = { ...summary, status: "approved" as const };
    summaries.set(approved.id, approved);
    save();
    return json(approved);
  }),
];
