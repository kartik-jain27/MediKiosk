import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { generateStaffId } from "@/lib/generateId";
import { mockVerify } from "@/lib/mockVerify";
import { useAuthStore } from "@/lib/stores/authStore";
import { useDirectoryStore } from "@/lib/stores/directoryStore";
import type { StaffProfile } from "@/types/rbac";

export function StaffRegister() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const addStaff = useDirectoryStore((state) => state.addStaff);
  const [verifying, setVerifying] = useState(false);
  const [staffId, setStaffId] = useState("");
  const [error, setError] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setVerifying(true); setError("");
    try {
      await mockVerify();
      const profile: StaffProfile = { staffId: generateStaffId(), name: String(form.get("name")), gender: String(form.get("gender")), email: String(form.get("email")).trim().toLowerCase(), phone: String(form.get("phone")), hospitalPosting: String(form.get("hospitalPosting")), governmentId: String(form.get("governmentId")), verified: true };
      addStaff(profile); login("staff", profile); setStaffId(profile.staffId);
    } catch { setError("Verification could not be completed. Please try again."); } finally { setVerifying(false); }
  };
  if (staffId) return <main className="access-page"><section className="access-panel success-panel"><p className="doctor-kicker">Verification complete</p><h1>Your Staff ID</h1><output>{staffId}</output><p>Keep this ID for future sign-in.</p><button onClick={() => navigate("/staff/dashboard")}>Continue to staff dashboard</button></section></main>;
  return <main className="access-page"><section className="access-panel"><p className="doctor-kicker">MediKiosk staff</p><h1>Register staff access</h1><p>Test mode is enabled: identity verification is skipped.</p><form onSubmit={submit}><label>Full name<input name="name" required autoComplete="name" /></label><label>Gender<select name="gender" required defaultValue=""><option value="" disabled>Select gender</option><option>Female</option><option>Male</option><option>Other</option><option>Prefer not to say</option></select></label><label>Work email<input name="email" type="email" required autoComplete="email" /></label><label>Phone<input name="phone" required inputMode="tel" autoComplete="tel" /></label><label>Hospital posting<input name="hospitalPosting" required /></label><label>Aadhaar number<input name="governmentId" inputMode="numeric" pattern="\d{12}" title="Enter a 12-digit Aadhaar number" required /></label>{error && <p className="doctor-error" role="alert">{error}</p>}<button disabled={verifying}>{verifying ? "Registering..." : "Register"}</button></form><p className="access-link">Already registered? <Link to="/staff/login">Staff sign in</Link></p></section></main>;
}
