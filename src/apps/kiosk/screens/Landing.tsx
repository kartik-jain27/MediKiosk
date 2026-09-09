import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  return <main className="screen landing-screen">
    <section className="hero-panel">
      <span className="eyebrow">{t("landing.badge")}</span>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <button className="button button-outline" onClick={() => speak(`${title}. ${subtitle}`, language)}>🔊 {t("common.listen")}</button>
      <div className="hero-meta">
        <span><strong>{institute}</strong><small>{terminal}</small></span>
      </div>
    </section>
    <section className="action-grid" aria-label="Start intake">
      <button className="action-card" onClick={() => begin(true)}><span>↻</span><strong>{t("landing.returning")}</strong><small>{t("landing.returningDetail")}</small></button>
      <button className="action-card" onClick={() => begin()}><span>＋</span><strong>{t("landing.newPatient")}</strong><small>{t("landing.newPatientDetail")}</small></button>
      <button className="action-card emergency" onClick={() => begin(false, true)}><span>⚠</span><strong>{t("landing.emergency")}</strong><small>{t("landing.emergencyDetail")}</small></button>
    </section>
    <section className="token-redemption"><button className="token-link" onClick={() => setShowToken((value) => !value)}>{t("landing.token.prompt")}</button>{showToken && <form onSubmit={redeem}><label>{t("landing.token.label")}<input value={token} onChange={(event) => setToken(event.target.value)} placeholder={t("landing.token.placeholder")} autoComplete="off" /></label><button className="button button-outline" disabled={!token.trim()}>{t("landing.token.submit")}</button>{tokenError && <p className="form-error" role="alert">{tokenError}</p>}</form>}</section>
  </main>;
}
