import type { MouseEvent } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/lib/stores/authStore";
import { useSessionStore } from "@/lib/stores/sessionStore";

const guardedPaths = new Set(["/kiosk/consent", "/kiosk/mode-select", "/kiosk/interview", "/kiosk/documents", "/kiosk/alert"]);

export function SiteHeader() {
  const { t } = useTranslation();
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
  const doctorPath = role === "doctor" ? "/doctor/queue" : "/doctor/access";

  const leaveIntake = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!intakeInProgress) return;
    if (!window.confirm(t("site.leaveIntake"))) { event.preventDefault(); return; }
    reset();
  };
  const signOut = () => {
    const next = role === "doctor" ? "/doctor/login" : "/staff/login";
    logout(); setDoctorSession(false); navigate(next);
  };

  return <><div className="site-utility"><span>{t("site.utility")}</span><span>{t("site.urgent")}</span></div><header className="site-header"><Link className="site-brand" to="/kiosk" onClick={leaveIntake}><b>MK</b><span>MediKiosk<small>{t("site.brandSubtitle")}</small></span></Link><nav className="site-nav" aria-label={t("site.primaryNavigation")}><Link to="/kiosk" onClick={leaveIntake}>{t("site.patientServices")}</Link><Link to={staffPath} onClick={leaveIntake}>{t("site.staffPortal")}</Link><Link to={doctorPath} onClick={leaveIntake}>{t("site.clinicalReview")}</Link></nav><div className="site-actions">{isKiosk && <div className="language-toggle" aria-label={t("site.languageSelection")}><button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")} aria-pressed={language === "en"}>English</button><button className={language === "hi" ? "active" : ""} onClick={() => setLanguage("hi")} aria-pressed={language === "hi"}>हिन्दी</button></div>}{!isKiosk && role && <button className="header-signout" onClick={signOut}>{t("site.signOut")}</button>}</div></header>{intakeInProgress && <div className="intake-notice"><span>{t("site.intakeInProgress")}</span><button onClick={() => { if (window.confirm(t("site.endIntake"))) { reset(); navigate("/kiosk"); } }}>{t("site.endSession")}</button></div>}</>;
}

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  if (compact) return <footer className="site-footer compact-footer"><span>{t("site.compactFooter")}</span></footer>;
  return <footer className="site-footer"><div><div className="footer-brand"><b>MK</b><strong>MediKiosk</strong></div><p>{t("site.footerDescription")}</p></div><div><strong>{t("site.patientInformation")}</strong><Link to="/kiosk">{t("site.howItWorks")}</Link><span>{t("site.patientCheckIn")}</span></div><div><strong>{t("site.careTeam")}</strong><Link to="/staff/login">{t("site.staffPortal")}</Link><Link to="/doctor/access">{t("site.clinicalReview")}</Link></div><div><strong>{t("site.support")}</strong><span>{t("site.supportDesk")}</span><span>{t("site.emergencySupport")}</span></div><small className="footer-legal">{t("site.legal")}</small></footer>;
}

export function PortalLayout() {
  return <div className="site-shell"><SiteHeader /><Outlet /><SiteFooter /></div>;
}
