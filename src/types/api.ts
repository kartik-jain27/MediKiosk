export interface Patient {
  id: string;
  name: string;
  phone: string;
  language: "en" | "hi";
  abhaId?: string;
}

export interface Consent {
  id: string;
  patientId: string;
  type: "history_collection" | "document_processing" | "data_sharing";
  status: "granted" | "revoked";
  timestamp: string;
}

export type InterviewStage =
  | "START" | "CHIEF_COMPLAINT" | "HPI" | "PAST_MEDICAL_HISTORY"
  | "SURGICAL_HISTORY" | "MEDICATIONS" | "ALLERGIES" | "FAMILY_HISTORY"
  | "PERSONAL_HISTORY" | "REVIEW_OF_SYSTEMS" | "DOCUMENT_UPLOAD"
  | "SUMMARY_GENERATION" | "COMPLETED";

export interface InterviewQuestion {
  id: string;
  stage: InterviewStage;
  text: string;
  type: "free_text" | "multiple_choice" | "scale" | "yes_no";
  options?: string[];
}

export interface TriageAlert {
  id: string;
  interviewId: string;
  severity: "high" | "critical";
  message: string;
  acknowledged: boolean;
}

export interface StructuredSummary {
  id: string;
  patientId: string;
  status: "draft" | "under_review" | "approved";
  sections: {
    chiefComplaint: string;
    hpi: string;
    pastMedicalHistory: string;
    pastSurgicalHistory: string;
    medications: string;
    allergies: string;
    familyHistory: string;
    personalHistory: string;
    reviewOfSystems: string;
  };
  mode: "general" | "ayush";
}

export interface TimelineEntry {
  date: string;
  label: string;
  source: "interview" | "document";
}

export interface DoctorQueueEntry {
  patientId: string;
  name: string;
  chiefComplaint: string;
  mode: StructuredSummary["mode"];
  hasRedFlag: boolean;
}

export interface InterviewProgress {
  stage: InterviewStage;
  stageIndex: number;
  totalStages: number;
}

export interface InterviewStartResponse {
  interviewId: string;
  question: InterviewQuestion;
}

export interface InterviewAnswerResponse {
  nextQuestion: InterviewQuestion | null;
  redFlag?: TriageAlert;
  progress: InterviewProgress;
}
