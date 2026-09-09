import assert from "node:assert/strict";
import test from "node:test";
import { interviewStages, isRedFlagAnswer, questionAt, summarySectionsFromAnswers } from "./flow.ts";

test("mock flow reaches review of systems and detects breathing red flags", () => {
  assert.equal(questionAt(0)?.stage, "CHIEF_COMPLAINT");
  assert.equal(questionAt(interviewStages.length - 1)?.stage, "REVIEW_OF_SYSTEMS");
  assert.equal(questionAt(interviewStages.length), null);
  assert.equal(questionAt(1)?.type, "scale");
  assert.equal(questionAt(7)?.type, "multiple_choice");
  assert.equal(isRedFlagAnswer("difficulty breathing"), true);
  assert.equal(isRedFlagAnswer("mild headache"), false);
  const sections = summarySectionsFromAnswers({ CHIEF_COMPLAINT: "Difficulty breathing", HPI: "8" });
  assert.equal(sections.chiefComplaint, "Difficulty breathing");
  assert.equal(sections.hpi, "8");
});
