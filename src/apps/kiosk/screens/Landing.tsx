import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { api } from "@/lib/api/client";
import { useSessionStore } from "@/lib/stores/sessionStore";
import { useTokenStore } from "@/lib/stores/tokenStore";

const institute = import.meta.env.VITE_INSTITUTE_NAME ?? "All India Institute of Ayurveda (AIIA)";
const terminal = import.meta.env.VITE_TERMINAL_LABEL ?? "Smart OPD Kiosk Terminal #03";

export function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const speak = useTextToSpeech();
  const { language, setPriority, setReturning, setPatientId, setPatientDraft } = useSessionStore();
  const redeemToken = useTokenStore((state) => state.redeemToken);
  const [showToken, setShowToken] = useState(false);
  const [token, setToken] = useState("");
  const [tokenError, setTokenError] = useState("");
  const title = t("landing.title");
  const subtitle = t("landing.subtitle");

  const begin = (returning = false, urgent = false) => {
    setReturning(returning);
    setPriority(urgent ? "urgent" : "normal");
    navigate("/kiosk/register");
  };
  const redeem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const redeemed = redeemToken(token);
    if (!redeemed) { setTokenError(t("landing.token.error")); return; }
    const draft = redeemed.patientDraft ?? {};
    try {
      const patient = await api.createPatient({ name: draft.name?.trim() || "Token Patient", phone: draft.phone?.trim() || "9000000000", language });
      setPatientId(patient.id); setPatientDraft(draft); setReturning(true); setPriority("normal"); navigate("/kiosk/consent");
    } catch { setTokenError(t("common.error")); }
  };

  return <main className="landing-page">
    <section className="landing-hero">
      <div className="landing-hero-content"><span className="eyebrow">{t("landing.badge")}</span><h1>{title}</h1><p>{subtitle}</p><div className="hero-actions"><button className="button button-primary" onClick={() => begin()}>{t("landing.newPatient")}</button><button className="button hero-listen" onClick={() => speak(`${title}. ${subtitle}`, language)}>{t("common.listen")}</button></div><div className="hero-meta"><span><strong>{institute}</strong><small>{terminal}</small></span><span><strong>Physician-reviewed record</strong><small>Structured before consultation</small></span></div></div>
    </section>
    <section className="landing-content"><div className="service-intro"><div><p className="section-kicker">Start here</p><h2>Choose the service that fits your visit</h2></div><p>Begin independently at the kiosk, continue an existing visit, or use the care-team portals for coordination.</p></div><div className="service-grid" aria-label="MediKiosk services"><button className="service-link" onClick={() => begin()}><strong>New patient intake</strong><span>Share your concern and medical context before meeting your clinician.</span></button><button className="service-link" onClick={() => begin(true)}><strong>Returning patient</strong><span>Continue with your details ready for today&apos;s visit.</span></button><Link className="service-link" to="/staff/login"><strong>Staff portal</strong><span>Issue tokens, record walk-ins, and assign patients to a clinician.</span></Link><Link className="service-link" to="/doctor/login"><strong>Clinical review</strong><span>Review structured intake summaries and finalize records.</span></Link></div><div className="landing-lower"><section className="token-redemption"><p className="section-kicker">Staff-assisted check-in</p><h2>Already have a patient token?</h2><p>Use the short code issued by reception to continue your intake with saved details.</p><button className="token-link" onClick={() => setShowToken((value) => !value)}>{t("landing.token.prompt")}</button>{showToken && <form onSubmit={redeem}><label>{t("landing.token.label")}<input value={token} onChange={(event) => setToken(event.target.value)} placeholder={t("landing.token.placeholder")} autoComplete="off" /></label><button className="button button-outline" disabled={!token.trim()}>{t("landing.token.submit")}</button>{tokenError && <p className="form-error" role="alert">{tokenError}</p>}</form>}</section><section className="urgent-panel"><p className="section-kicker">Need urgent attention?</p><h2>Tell clinic staff right away.</h2><p>For severe symptoms or immediate danger, alert nearby staff. This intake flow is not emergency care.</p><button className="urgent-link" onClick={() => begin(false, true)}>{t("landing.emergency")}</button></section></div></section>
  </main>;
}
