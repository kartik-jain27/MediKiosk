import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api/client";
import { useSessionStore } from "@/lib/stores/sessionStore";

export function Alert() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { alert, setAlert } = useSessionStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { if (!alert) navigate("/kiosk/interview", { replace: true }); }, [alert, navigate]);
  if (!alert) return null;
  const continueFlow = async () => { setLoading(true); setError(""); try { await api.acknowledgeTriageAlert(alert.id); setAlert(null); navigate("/kiosk/interview"); } catch { setError(t("common.error")); } finally { setLoading(false); } };
  return <main className="alert-screen" role="alert"><div className="alert-symbol" aria-hidden="true">⚠</div><p className="severity">{alert.severity} {t("alert.severity")}</p><h1>{t("alert.title")}</h1><p>{alert.message}</p><strong>{t("alert.instruction")}</strong>{error && <p className="form-error">{error}</p>}<button className="button alert-button" disabled={loading} onClick={() => void continueFlow()}>{loading ? t("common.pleaseWait") : t("common.continue")}</button></main>;
}
