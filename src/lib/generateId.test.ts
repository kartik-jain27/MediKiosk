import assert from "node:assert/strict";
import test from "node:test";
import { generateDoctorId, generateStaffId, generateToken } from "./generateId.ts";

test("role identifiers use readable prefixes and token length", () => {
  assert.match(generateDoctorId(), /^DOC-[A-HJ-NP-Z2-9]{5}$/);
  assert.match(generateStaffId(), /^STF-[A-HJ-NP-Z2-9]{5}$/);
  assert.match(generateToken(), /^[A-HJ-NP-Z2-9]{6}$/);
});
