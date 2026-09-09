import type { InterviewQuestion, InterviewStage, StructuredSummary } from "@/types/api";

export const interviewStages = [
  "CHIEF_COMPLAINT", "HPI", "PAST_MEDICAL_HISTORY", "SURGICAL_HISTORY",
  "MEDICATIONS", "ALLERGIES", "FAMILY_HISTORY", "PERSONAL_HISTORY", "REVIEW_OF_SYSTEMS",
] as const satisfies readonly InterviewStage[];

const questions: Record<(typeof interviewStages)[number], Omit<InterviewQuestion, "id" | "stage">> = {
  CHIEF_COMPLAINT: { text: "What brings you in today?", type: "free_text" },
  HPI: { text: "How much is this affecting your daily life today?", type: "scale" },
  PAST_MEDICAL_HISTORY: { text: "Do you have any medical conditions?", type: "yes_no" },
  SURGICAL_HISTORY: { text: "Have you had any surgeries?", type: "yes_no" },
  MEDICATIONS: { text: "Which medicines do you take regularly?", type: "free_text" },
  ALLERGIES: { text: "Do you have any allergies?", type: "yes_no" },
  FAMILY_HISTORY: { text: "Are there important health conditions in your family?", type: "free_text" },
  PERSONAL_HISTORY: { text: "Which statement best describes your daily habits?", type: "multiple_choice", options: ["No tobacco or alcohol", "Tobacco", "Alcohol", "Both"] },
  REVIEW_OF_SYSTEMS: { text: "Are you experiencing any other symptoms?", type: "free_text" },
};

export const questionAt = (index: number): InterviewQuestion | null => {
  const stage = interviewStages[index];
  return stage ? { id: stage.toLowerCase(), stage, ...questions[stage] } : null;
};

export const isRedFlagAnswer = (answer: string) => /breathing|saans/i.test(answer);

export const summarySectionsFromAnswers = (answers: Partial<Record<InterviewStage, string>> = {}): StructuredSummary["sections"] => ({
  chiefComplaint: answers.CHIEF_COMPLAINT || "Patient-reported concern pending review.",
  hpi: answers.HPI || "Not recorded.",
  pastMedicalHistory: answers.PAST_MEDICAL_HISTORY || "Not recorded.",
  pastSurgicalHistory: answers.SURGICAL_HISTORY || "Not recorded.",
  medications: answers.MEDICATIONS || "Not recorded.",
  allergies: answers.ALLERGIES || "Not recorded.",
  familyHistory: answers.FAMILY_HISTORY || "Not recorded.",
  personalHistory: answers.PERSONAL_HISTORY || "Not recorded.",
  reviewOfSystems: answers.REVIEW_OF_SYSTEMS || "Not recorded.",
});
