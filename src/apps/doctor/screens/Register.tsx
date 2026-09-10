import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { generateDoctorId } from "@/lib/generateId";
import { mockVerify } from "@/lib/mockVerify";
import { useAuthStore } from "@/lib/stores/authStore";
import { useDirectoryStore } from "@/lib/stores/directoryStore";
import { useSessionStore } from "@/lib/stores/sessionStore";
import type { DoctorProfile } from "@/types/rbac";

export function DoctorRegister() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const addDoctor = useDirectoryStore((state) => state.addDoctor);
  const setDoctorSession = useSessionStore((state) => state.setDoctorSession);
  const [verifying, setVerifying] = useState(false);
  const [doctorId, setDoctorId] = useState("");
  const [error, setError] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setVerifying(true); setError("");
    try {
      await mockVerify();
      const aadhaar = String(form.get("aadhaar")).replace(/\D/g, "");
      const profile: DoctorProfile = { doctorId: generateDoctorId(), name: String(form.get("name")), gender: String(form.get("gender")), email: String(form.get("email")).trim().toLowerCase(), phone: String(form.get("phone")), licenseNumber: String(form.get("licenseNumber")), aadhaarLast4: aadhaar.slice(-4), hospitalPosting: String(form.get("hospitalPosting")), verified: true };
      addDoctor(profile); login("doctor", profile); setDoctorSession(true); setDoctorId(profile.doctorId);
    } catch { setError("Verification could not be completed. Please try again."); } finally { setVerifying(false); }
  };
  if (doctorId) return <main className="access-page"><section className="access-panel success-panel"><p className="doctor-kicker">Verification complete</p><h1>Your Doctor ID</h1><output>{doctorId}</output><p>Keep this ID for future sign-in.</p><button onClick={() => navigate("/doctor/queue")}>Continue to clinical review</button></section></main>;
  return <main className="access-page"><section className="access-panel"><p className="doctor-kicker">MediKiosk clinical review</p><h1>Register doctor access</h1><p>Test mode is enabled: license and identity verification are skipped.</p><form onSubmit={submit}><label>Full name<input name="name" required autoComplete="name" /></label><label>Gender<select name="gender" required defaultValue=""><option value="" disabled>Select gender</option><option>Female</option><option>Male</option><option>Other</option><option>Prefer not to say</option></select></label><label>Work email<input name="email" type="email" required autoComplete="email" /></label><label>Phone<input name="phone" required inputMode="tel" autoComplete="tel" /></label><label>Hospital posting<input name="hospitalPosting" required /></label><label>Medical license number<input name="licenseNumber" required /></label><label>Aadhaar number<input name="aadhaar" inputMode="numeric" pattern="\d{12}" title="Enter a 12-digit Aadhaar number" required /></label>{error && <p className="doctor-error" role="alert">{error}</p>}<button disabled={verifying}>{verifying ? "Registering..." : "Register"}</button></form><p className="access-link">Already registered? <Link to="/doctor/login">Doctor sign in</Link></p></section></main>;
}
