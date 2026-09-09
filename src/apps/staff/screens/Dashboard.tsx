import { type FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DoctorSearch } from "@/apps/shared/components/DoctorSearch";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/authStore";
import { useDoctorQueueStore } from "@/lib/stores/doctorQueueStore";
import { useSessionStore } from "@/lib/stores/sessionStore";
import { useTokenStore } from "@/lib/stores/tokenStore";
import type { DoctorProfile, StaffAssignmentCandidate } from "@/types/rbac";

export function StaffDashboard() {
  const staff = useAuthStore((state) => state.currentStaff);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const generateToken = useTokenStore((state) => state.generateToken);
  const tokens = useTokenStore((state) => state.tokens);
  const queueItems = useDoctorQueueStore((state) => state.items);
  const assignToDoctor = useDoctorQueueStore((state) => state.assignToDoctor);
  const { setPatientId, setPatientDraft, setPriority, setReturning, setDepartmentId } = useSessionStore();
  const formRef = useRef<HTMLFormElement>(null);
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [tokenDraft, setTokenDraft] = useState({ name: "", phone: "", chiefComplaint: "" });
  const [candidates, setCandidates] = useState<StaffAssignmentCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<StaffAssignmentCandidate | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    const loadCandidates = () => void api.getStaffAssignmentCandidates().then(setCandidates).catch(() => setError("Could not load completed patient intakes."));
    loadCandidates();
    const sync = (event: StorageEvent) => { if (event.key === "medikiosk-mock-data") loadCandidates(); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  if (!staff) return null;
  const staffTokens = tokens.filter((item) => item.issuedByStaffId === staff.staffId);
  const availableCandidates = candidates.filter((candidate) => !queueItems.some((item) => item.summaryId === candidate.summaryId));
  const issueToken = () => { setToken(generateToken(staff.staffId, tokenDraft).token); setCopied(false); };
  const copyToken = async () => { if (!token || !navigator.clipboard) return; try { await navigator.clipboard.writeText(token); setCopied(true); } catch { setError("Could not copy the token."); } };
  const startFullIntake = async () => {
    const form = new FormData(formRef.current ?? undefined);
    const name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    if (!name || !phone) { setError("Enter the patient name and phone number before starting intake."); return; }
    setLoading(true); setError("");
    try {
      const patient = await api.createPatient({ name, phone, language: "en" });
      setPatientId(patient.id); setPatientDraft({ name, phone, chiefComplaint: String(form.get("chiefComplaint") ?? "").trim() }); setPriority("normal"); setReturning(false); setDepartmentId(null); navigate("/kiosk/consent");
    } catch { setError("Could not start the patient intake."); } finally { setLoading(false); }
  };
  const createManualPatient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name")).trim();
    const phone = String(form.get("phone")).trim();
    const chiefComplaint = String(form.get("chiefComplaint")).trim();
    if (!name || !phone || !chiefComplaint) return;
    setLoading(true); setError("");
    try {
      const patient = await api.createPatient({ name, phone, language: "en" });
      const summary = await api.createManualSummary({ patientId: patient.id, chiefComplaint });
      const candidate = { patientId: patient.id, patientName: patient.name, summaryId: summary.id, chiefComplaint, priority: "normal" as const };
      setCandidates((items) => [...items, candidate]); setSelectedCandidate(candidate); setConfirmation("Manual patient summary is ready to assign.");
    } catch { setError("Could not create the patient summary."); } finally { setLoading(false); }
  };
  const assign = () => {
    if (!selectedCandidate || !selectedDoctor) return;
    assignToDoctor(selectedDoctor.doctorId, { id: selectedCandidate.summaryId, patientId: selectedCandidate.patientId, patientName: selectedCandidate.patientName, summaryId: selectedCandidate.summaryId, priority: selectedCandidate.priority, status: "pending", assignedAt: new Date().toISOString() });
    setConfirmation(`${selectedCandidate.patientName} was sent to ${selectedDoctor.name}.`); setSelectedCandidate(null); setSelectedDoctor(null); formRef.current?.reset();
  };
  return <main className="doctor-page"><div className="doctor-page-heading"><div><p className="doctor-kicker">Staff dashboard</p><h1>Welcome, {staff.name}</h1></div><button className="staff-signout" onClick={() => { logout(); navigate("/staff/login"); }}>Sign out</button></div><p>{staff.hospitalPosting}</p>
    <section className="staff-token"><h2>Patient intake token</h2><p>Optional details are carried into the kiosk when this token is redeemed.</p><div className="token-draft"><input value={tokenDraft.name} onChange={(event) => setTokenDraft({ ...tokenDraft, name: event.target.value })} placeholder="Patient name (optional)" /><input value={tokenDraft.phone} onChange={(event) => setTokenDraft({ ...tokenDraft, phone: event.target.value })} placeholder="Phone (optional)" /><input value={tokenDraft.chiefComplaint} onChange={(event) => setTokenDraft({ ...tokenDraft, chiefComplaint: event.target.value })} placeholder="Chief complaint (optional)" /></div><button onClick={issueToken}>Generate New Patient Token</button>{token && <div className="token-display"><output aria-live="polite">{token}</output><button className="copy-token" onClick={() => void copyToken()}>{copied ? "Copied" : "Copy"}</button></div>}</section>
    <section className="token-table"><h2>Issued tokens</h2><div className="token-table-head"><span>Code</span><span>Status</span><span>Created</span></div>{staffTokens.map((item) => <div className="token-row" key={item.token}><strong>{item.token}</strong><span className={`token-status ${item.status}`}>{item.status}</span><time>{new Date(item.createdAt).toLocaleString()}</time></div>)}{!staffTokens.length && <p>No tokens issued yet.</p>}</section>
    <section className="walk-in"><h2>Add walk-in patient</h2><form ref={formRef} onSubmit={(event) => void createManualPatient(event)}><label>Name<input name="name" required /></label><label>Phone<input name="phone" required inputMode="tel" /></label><label>Chief complaint<input name="chiefComplaint" required /></label><div className="answer-actions"><button disabled={loading}>Quick manual entry</button><button type="button" className="secondary-action" disabled={loading} onClick={() => void startFullIntake()}>Conduct full intake interview</button></div></form></section>
    {availableCandidates.length > 0 && <section className="assignment-panel"><h2>Assign to doctor</h2><select value={selectedCandidate?.summaryId ?? ""} onChange={(event) => setSelectedCandidate(availableCandidates.find((candidate) => candidate.summaryId === event.target.value) ?? null)}><option value="">Choose a completed patient</option>{availableCandidates.map((candidate) => <option key={candidate.summaryId} value={candidate.summaryId}>{candidate.patientName} · {candidate.chiefComplaint}</option>)}</select><DoctorSearch onSelect={setSelectedDoctor} />{selectedDoctor && <p>Selected doctor: <strong>{selectedDoctor.name}</strong></p>}<button disabled={!selectedCandidate || !selectedDoctor} onClick={assign}>Send to Doctor&apos;s Queue</button></section>}
    {error && <p className="doctor-error" role="alert">{error}</p>}{confirmation && <p className="assignment-confirmation" role="status">{confirmation}</p>}
  </main>;
}
