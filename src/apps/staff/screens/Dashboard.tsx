import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DoctorSearch } from "@/apps/shared/components/DoctorSearch";
import { api } from "@/lib/api/client";
import { generatePatientId } from "@/lib/generateId";
import { mockVerify } from "@/lib/mockVerify";
import { useAuthStore } from "@/lib/stores/authStore";
import { useDoctorQueueStore } from "@/lib/stores/doctorQueueStore";
import { usePatientRegistryStore } from "@/lib/stores/patientRegistryStore";
import { useSessionStore } from "@/lib/stores/sessionStore";
import type { DoctorProfile, RegisteredPatient, StaffAssignmentCandidate } from "@/types/rbac";

const isToday = (value: string) => new Date(value).toDateString() === new Date().toDateString();

export function StaffDashboard() {
  const staff = useAuthStore((state) => state.currentStaff);
  const navigate = useNavigate();
  const queueItems = useDoctorQueueStore((state) => state.items);
  const assignToDoctor = useDoctorQueueStore((state) => state.assignToDoctor);
  const patients = usePatientRegistryStore((state) => state.patients);
  const addPatient = usePatientRegistryStore((state) => state.addPatient);
  const recordIntake = usePatientRegistryStore((state) => state.recordIntake);
  const { reset, setDepartmentId, setPatientDraft, setPatientId, setPriority, setReturning } = useSessionStore();
  const [candidates, setCandidates] = useState<StaffAssignmentCandidate[]>([]);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [registeredPatient, setRegisteredPatient] = useState<RegisteredPatient | null>(null);
  const [lookupId, setLookupId] = useState("");
  const [intakePatient, setIntakePatient] = useState<RegisteredPatient | null>(null);
  const [urgent, setUrgent] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<StaffAssignmentCandidate | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    const loadCandidates = () => void api.getStaffAssignmentCandidates().then(setCandidates).catch(() => setError("Could not load completed patient intakes."));
    const sync = (event: StorageEvent) => { if (event.key === "medikiosk-mock-data") loadCandidates(); };
    loadCandidates();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const dailyPatients = useMemo(() => patients.filter((patient) => patient.issuedByStaffId === staff?.staffId && isToday(patient.createdAt)), [patients, staff?.staffId]);
  const availableCandidates = useMemo(() => candidates.map((candidate) => {
    const profile = patients.find((patient) => patient.latestIntakeId === candidate.patientId);
    return profile && candidate.priority !== "critical" ? { ...candidate, priority: profile.priority } : candidate;
  }).filter((candidate) => !queueItems.some((item) => item.summaryId === candidate.summaryId)), [candidates, patients, queueItems]);

  if (!staff) return null;

  const registerPatient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true); setError("");
    try {
      await mockVerify();
      const patient = { name: String(form.get("name")).trim(), age: Number(form.get("age")), gender: String(form.get("gender")), email: String(form.get("email")).trim().toLowerCase(), phone: String(form.get("phone")).trim(), aadhaarLast4: String(form.get("aadhaar")).replace(/\D/g, "").slice(-4), latestIntakeId: undefined, medikioskId: generatePatientId(), issuedByStaffId: staff.staffId, priority: "normal" as const, createdAt: new Date().toISOString() };
      addPatient(patient); setRegisteredPatient(patient);
    } catch { setError("Verification could not be started. Please try again."); } finally { setLoading(false); }
  };

  const verifyPatientForIntake = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const patient = patients.find((item) => item.medikioskId === lookupId.trim().toUpperCase());
    if (!patient) { setError("No registered MediKiosk ID was found."); return; }
    setLoading(true); setError("");
    try { await mockVerify(); setIntakePatient(patient); } catch { setError("Verification could not be started. Please try again."); } finally { setLoading(false); }
  };

  const startIntake = async () => {
    if (!intakePatient) return;
    setLoading(true); setError("");
    try {
      const patient = await api.createPatient({ name: intakePatient.name, phone: intakePatient.phone, language: "en" });
      reset(); setPatientId(patient.id); setPatientDraft({ name: intakePatient.name, phone: intakePatient.phone }); setPriority(urgent ? "urgent" : "normal"); setReturning(true); setDepartmentId(null); recordIntake(intakePatient.medikioskId, patient.id, urgent ? "urgent" : "normal"); navigate("/kiosk/consent");
    } catch { setError("Could not start the patient intake."); } finally { setLoading(false); }
  };

  const assign = () => {
    if (!selectedCandidate || !selectedDoctor) return;
    assignToDoctor(selectedDoctor.doctorId, { id: selectedCandidate.summaryId, patientId: selectedCandidate.patientId, patientName: selectedCandidate.patientName, summaryId: selectedCandidate.summaryId, priority: selectedCandidate.priority, status: "pending", assignedAt: new Date().toISOString() });
    setConfirmation(`${selectedCandidate.patientName} was sent to ${selectedDoctor.name}.`); setSelectedCandidate(null); setSelectedDoctor(null);
  };

  return <main className="doctor-page staff-workspace"><div className="doctor-page-heading"><div><p className="doctor-kicker">Staff dashboard</p><h1>Welcome, {staff.name}</h1></div></div><p>{staff.hospitalPosting}</p>
    <section className="staff-command"><div><p className="section-kicker">Patient registry</p><h2>Register a new MediKiosk ID</h2><p>Create a patient profile before any clinical intake begins.</p></div><button onClick={() => { setRegistrationOpen(true); setRegisteredPatient(null); setError(""); }}>Register patient</button></section>
    <section className="intake-access"><p className="section-kicker">New patient intake</p><h2>Find a registered patient</h2><p>Enter their MediKiosk ID, then continue into the existing consent and interview flow.</p><form onSubmit={verifyPatientForIntake}><label>MediKiosk ID<input value={lookupId} onChange={(event) => setLookupId(event.target.value)} placeholder="PT-7F3K2M" autoComplete="off" required /></label><button disabled={loading}>{loading ? "Finding patient..." : "Find patient"}</button></form>{intakePatient && <div className="intake-verify"><p><strong>{intakePatient.name}</strong> is ready for intake.</p><label className="urgent-check"><input type="checkbox" checked={urgent} onChange={(event) => setUrgent(event.target.checked)} /> Mark for immediate staff attention</label><button disabled={loading} onClick={() => void startIntake()}>{loading ? "Starting..." : "Start patient intake"}</button></div>}</section>
    <section className="daily-patients"><div className="section-heading"><div><p className="section-kicker">Today</p><h2>Registered patients</h2></div><span>{dailyPatients.length} today</span></div><div className="patient-table-head"><span>MediKiosk ID</span><span>Patient</span><span>Intake status</span></div>{dailyPatients.map((patient) => <div className="patient-row" key={patient.medikioskId}><strong>{patient.medikioskId}</strong><span>{patient.name}<small>{patient.phone}</small></span><span className={`token-status ${patient.priority}`}>{patient.latestIntakeId ? "intake started" : "registered"}{patient.priority === "urgent" ? " - urgent" : ""}</span></div>)}{!dailyPatients.length && <p>No patients registered by you today.</p>}</section>
    <section className="saved-doctors"><p className="section-kicker">Saved doctors</p><h2>Doctors at {staff.hospitalPosting}</h2><p>Search by Doctor ID below. Saved doctors remain at the top for assignment.</p><DoctorSearch onSelect={setSelectedDoctor} />{selectedDoctor && <p>Selected doctor: <strong>{selectedDoctor.name}</strong></p>}</section>
    {availableCandidates.length > 0 && <section className="assignment-panel"><h2>Send completed intake to doctor</h2><select value={selectedCandidate?.summaryId ?? ""} onChange={(event) => setSelectedCandidate(availableCandidates.find((candidate) => candidate.summaryId === event.target.value) ?? null)}><option value="">Choose a completed patient</option>{availableCandidates.map((candidate) => <option key={candidate.summaryId} value={candidate.summaryId}>{candidate.patientName} - {candidate.chiefComplaint}</option>)}</select>{selectedDoctor && <p>Selected doctor: <strong>{selectedDoctor.name}</strong></p>}<button disabled={!selectedCandidate || !selectedDoctor} onClick={assign}>Send to Doctor&apos;s Queue</button></section>}
    {error && <p className="doctor-error" role="alert">{error}</p>}{confirmation && <p className="assignment-confirmation" role="status">{confirmation}</p>}
    {registrationOpen && <div className="modal-backdrop" role="presentation"><section className="patient-modal" role="dialog" aria-modal="true" aria-labelledby="register-patient-title"><button className="modal-close" onClick={() => { setRegistrationOpen(false); setRegisteredPatient(null); setError(""); }} aria-label="Close registration">x</button>{registeredPatient ? <div className="registration-success"><p className="section-kicker">Patient registered</p><h2 id="register-patient-title">MediKiosk ID created</h2><output>{registeredPatient.medikioskId}</output><p>{registeredPatient.name} can use this ID with clinic staff for future check-in. Test mode skips OTP and message delivery so you can move straight through the flow.</p><button onClick={() => { setRegistrationOpen(false); setRegisteredPatient(null); }}>Done</button></div> : <><p className="section-kicker">New patient</p><h2 id="register-patient-title">Register new MediKiosk ID</h2><p>Test mode is enabled: identity verification, OTP, SMS, and email delivery are skipped.</p><form className="patient-registration-form" onSubmit={registerPatient}><label>Name<input name="name" required autoComplete="name" /></label><label>Age<input name="age" type="number" min="0" max="120" required /></label><label>Gender<select name="gender" required defaultValue=""><option value="" disabled>Select gender</option><option>Female</option><option>Male</option><option>Other</option><option>Prefer not to say</option></select></label><label>Email<input name="email" type="email" required autoComplete="email" /></label><label>Phone<input name="phone" inputMode="tel" pattern="[0-9]{10}" title="Enter a 10-digit mobile number" required autoComplete="tel" /></label><label>Aadhaar number<input name="aadhaar" inputMode="numeric" pattern="[0-9]{12}" title="Enter a 12-digit Aadhaar number" required /></label><button disabled={loading}>{loading ? "Registering..." : "Create MediKiosk ID"}</button></form></>}</section></div>}
  </main>;
}
