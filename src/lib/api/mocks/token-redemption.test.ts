import assert from "node:assert/strict";
import test from "node:test";
import { setupServer } from "msw/node";
import { handlers } from "./handlers.ts";

test("MSW creates the patient used by token redemption", async () => {
  const server = setupServer(...handlers);
  server.listen({ onUnhandledRequest: "error" });
  try {
    const response = await fetch("http://localhost/api/patients", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Token Patient", phone: "9000000000", language: "en" }) });
    assert.equal(response.status, 200);
    const patient = await response.json() as { id: string; name: string; phone: string };
    assert.ok(patient.id);
    assert.equal(patient.name, "Token Patient");
    assert.equal(patient.phone, "9000000000");
  } finally {
    server.close();
  }
});
