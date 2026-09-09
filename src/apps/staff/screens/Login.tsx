import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/stores/authStore";
import { useDirectoryStore } from "@/lib/stores/directoryStore";

export function StaffLogin() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const staff = useDirectoryStore((state) => state.staff);
  const [error, setError] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email")).trim().toLowerCase();
    const staffId = String(new FormData(event.currentTarget).get("staffId")).trim().toUpperCase();
    const profile = staff.find((item) => item.email === email && item.staffId === staffId);
    if (!profile) { setError("Email and Staff ID do not match a registered staff member."); return; }
    login("staff", profile); navigate("/staff/dashboard");
  };
  return <main className="access-page"><section className="access-panel"><p className="doctor-kicker">MediKiosk staff</p><h1>Staff sign in</h1><form onSubmit={submit}><label>Work email<input name="email" type="email" required autoComplete="email" /></label><label>Staff ID<input name="staffId" placeholder="STF-9K2M1" required autoComplete="off" /></label>{error && <p className="doctor-error" role="alert">{error}</p>}<button>Sign in</button></form><p className="access-link">Need access? <Link to="/staff/register">Register as staff</Link></p></section></main>;
}
