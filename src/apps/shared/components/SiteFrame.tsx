import type { MouseEvent } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/stores/authStore";
import { useSessionStore } from "@/lib/stores/sessionStore";

const guardedPaths = new Set(["/kiosk/interview", "/kiosk/documents", "/kiosk/alert"]);

export function SiteHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);
  const logout = useAuthStore((state) => state.logout);
  const language = useSessionStore((state) => state.language);
  const setLanguage = useSessionStore((state) => state.setLanguage);
  const setDoctorSession = useSessionStore((state) => state.setDoctorSession);
  const reset = useSessionStore((state) => state.reset);
  const isKiosk = location.pathname.startsWith("/kiosk");
  const intakeInProgress = guardedPaths.has(location.pathname);
  const staffPath = role === "staff" ? "/staff/dashboard" : "/staff/login";
  const doctorPath = role === "doctor" ? "/doctor/queue" : "/doctor/login";

  const leaveIntake = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!intakeInProgress) return;
    if (!window.confirm("Leave this intake? Unsaved answers will be lost.")) { event.preventDefault(); return; }
    reset();
  };
  const signOut = () => {
    const next = role === "doctor" ? "/doctor/login" : "/staff/login";
    logout(); setDoctorSession(false); navigate(next);
  };

  return <><div className="site-utility"><span>Clinical intake and care coordination</span><span>For urgent symptoms, alert clinic staff immediately.</span></div><header className="site-header"><Link className="site-brand" to="/kiosk" onClick={leaveIntake}><b>MK</b><span>MediKiosk<small>Clinical intake portal</small></span></Link><nav className="site-nav" aria-label="Primary navigation"><Link to="/kiosk" onClick={leaveIntake}>Patient services</Link><Link to={staffPath} onClick={leaveIntake}>Staff portal</Link><Link to={doctorPath} onClick={leaveIntake}>Clinical review</Link></nav><div className="site-actions">{isKiosk && <div className="language-toggle" aria-label="Language selection"><button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")} aria-pressed={language === "en"}>English</button><button className={language === "hi" ? "active" : ""} onClick={() => setLanguage("hi")} aria-pressed={language === "hi"}>हिन्दी</button></div>}{!isKiosk && role && <button className="header-signout" onClick={signOut}>Sign out</button>}</div></header>{intakeInProgress && <div className="intake-notice"><span>Intake in progress</span><button onClick={() => { if (window.confirm("End this intake? Unsaved answers will be lost.")) { reset(); navigate("/kiosk"); } }}>End session</button></div>}</>;
}

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  if (compact) return <footer className="site-footer compact-footer"><span>MediKiosk supports clinical intake. Your clinician reviews the final record.</span></footer>;
  return <footer className="site-footer"><div><div className="footer-brand"><b>MK</b><strong>MediKiosk</strong></div><p>Structured clinical intake with the physician in control of the final record.</p></div><div><strong>Patient services</strong><Link to="/kiosk">Start an intake</Link><Link to="/kiosk">Use a staff token</Link></div><div><strong>Care team</strong><Link to="/staff/login">Staff portal</Link><Link to="/doctor/login">Clinical review</Link></div><div><strong>Support</strong><span>Speak with your clinic reception desk for assistance.</span><span>Emergency symptoms need immediate staff attention.</span></div><small className="footer-legal">MediKiosk is an intake workflow tool. It does not replace clinical judgment or emergency care.</small></footer>;
}

export function PortalLayout() {
  return <div className="site-shell"><SiteHeader /><Outlet /><SiteFooter /></div>;
}
