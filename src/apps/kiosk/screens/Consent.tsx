import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Consent as ConsentType } from "@/types/api";
import { api } from "@/lib/api/client";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSessionStore } from "@/lib/stores/sessionStore";

const consentTypes: ConsentType["type"][] = ["history_collection", "document_processing", "data_sharing"];

export function Consent() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const speak = useTextToSpeech();
  const { patientId, language } = useSessionStore();
  const [granted, setGranted] = useState<Record<ConsentType["type"], boolean>>({ history_collection: false, document_processing: false, data_sharing: false });
  const [consentIds, setConsentIds] = useState<Partial<Record<ConsentType["type"], string>>>({});
  const [pending, setPending] = useState<Partial<Record<ConsentType["type"], boolean>>>({});
  const [error, setError] = useState("");
  const explanation = t("consent.explanation");
  const toggle = async (type: ConsentType["type"], checked: boolean) => {
    setError("");
    setGranted((value) => ({ ...value, [type]: checked }));
    if (!patientId) { setGranted((value) => ({ ...value, [type]: false })); return; }
    setPending((value) => ({ ...value, [type]: true }));
    try {
      if (checked) {
        const consent = await api.grantConsent(patientId, { type });
        setConsentIds((value) => ({ ...value, [type]: consent.id }));
      } else if (consentIds[type]) {
        await api.revokeConsent(consentIds[type]);
        setConsentIds((value) => ({ ...value, [type]: undefined }));
      }
    } catch {
      setError(t("common.error"));
      setGranted((value) => ({ ...value, [type]: !checked }));
    } finally { setPending((value) => ({ ...value, [type]: false })); }
  };

  return <main className="screen consent-screen"><h1>{t("consent.title")}</h1><p>{explanation}</p>
    <button className="button button-outline" onClick={() => speak(explanation, language)}>🔊 {t("common.listen")}</button>
    <section className="info-grid">
      {(["collected", "used", "never"] as const).map((item) => <article className="info-card" key={item}><h2>{t(`consent.${item}.title`)}</h2><p>{t(`consent.${item}.body`)}</p></article>)}
    </section>
    <section className="consent-list" aria-label={t("consent.title")}>
      {consentTypes.map((type) => <label className="consent-row" key={type}><input type="checkbox" checked={granted[type]} disabled={pending[type]} onChange={(event) => void toggle(type, event.target.checked)} /><span><strong>{t(`consent.items.${type}.title`)}</strong><small>{t(`consent.items.${type}.detail`)}</small></span></label>)}
    </section>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button button-primary" disabled={!Object.values(granted).every(Boolean)} onClick={() => navigate("/kiosk/mode-select")}>{t("common.continue")}</button>
  </main>;
}
