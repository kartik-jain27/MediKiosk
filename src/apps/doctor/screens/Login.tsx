import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/stores/authStore";
import { useDirectoryStore } from "@/lib/stores/directoryStore";
import { useSessionStore } from "@/lib/stores/sessionStore";

export function Login() {
  const navigate = useNavigate();
  const setDoctorSession = useSessionStore((state) => state.setDoctorSession);
  const login = useAuthStore((state) => state.login);
  const doctors = useDirectoryStore((state) => state.doctors);
  const [email, setEmail] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [error, setError] = useState("");
  const submit = (event: FormEvent) => { event.preventDefault(); const profile = doctors.find((doctor) => doctor.email === email.trim().toLowerCase() && doctor.doctorId === doctorId.trim().toUpperCase()); if (!profile) { setError("Email and Doctor ID do not match a registered doctor."); return; } login("doctor", profile); setDoctorSession(true); navigate("/doctor/queue"); };
  return <main className="doctor-login"><section><p className="doctor-kicker">MediKiosk</p><h1>Clinical review</h1><p>Review patient intake summaries before clinical use.</p><form onSubmit={submit}><label>Work email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label><label>Doctor ID<input value={doctorId} onChange={(event) => setDoctorId(event.target.value)} placeholder="DOC-7F3K2" autoComplete="off" required /></label>{error && <p className="doctor-error" role="alert">{error}</p>}<button disabled={!email.trim() || !doctorId.trim()}>Sign in</button></form><p className="access-link">Need doctor access? <Link to="/doctor/register">Register a doctor profile</Link></p></section></main>;
}
