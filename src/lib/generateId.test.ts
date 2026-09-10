import assert from "node:assert/strict";
import test from "node:test";
import { generateDoctorId, generatePatientId, generateStaffId } from "./generateId.ts";

test("role and patient identifiers use readable prefixes", () => {
  assert.match(generateDoctorId(), /^DOC-[A-HJ-NP-Z2-9]{5}$/);
  assert.match(generateStaffId(), /^STF-[A-HJ-NP-Z2-9]{5}$/);
  assert.match(generatePatientId(), /^PT-[A-HJ-NP-Z2-9]{6}$/);
});
