import { Link } from "react-router-dom";

export function DoctorAccess() {
  return <main className="access-page"><section className="access-panel doctor-access-choice"><p className="doctor-kicker">MediKiosk clinical review</p><h1>Doctor access</h1><p>Sign in with your Doctor ID to review assigned patient records, or create a verified doctor profile first.</p><div className="access-actions"><Link className="button button-primary" to="/doctor/login">Authenticate as doctor</Link><Link className="button button-outline" to="/doctor/register">Register as doctor</Link></div></section></main>;
}
