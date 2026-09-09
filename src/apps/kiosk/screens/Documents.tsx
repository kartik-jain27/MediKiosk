import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api/client";
import { useSessionStore } from "@/lib/stores/sessionStore";

export function Documents() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { patientId, interviewId, setSummaryId } = useSessionStore();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [generating, setGenerating] = useState(false);
  const [data, setData] = useState<object | null>(null);
  const [error, setError] = useState("");
  const timer = useRef<number | null>(null);
  const preview = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);
  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current); if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const upload = async (selected: File) => {
    if (timer.current) window.clearInterval(timer.current);
    setFile(selected); setData(null); setStatus("processing"); setError("");
    try { const { documentId } = await api.uploadDocument(selected); timer.current = window.setInterval(async () => { try { const result = await api.getDocumentStatus(documentId); if (result.status === "done") { if (timer.current) window.clearInterval(timer.current); setStatus("done"); setData(result.extractedData ?? {}); } } catch { if (timer.current) window.clearInterval(timer.current); setError(t("common.error")); setStatus("idle"); } }, 2000); } catch { setError(t("common.error")); setStatus("idle"); }
  };
  const continueFlow = async () => { if (!patientId || !interviewId || status === "processing" || generating) return; setGenerating(true); try { const summary = await api.generateSummary({ patientId, interviewId }); setSummaryId(summary.id); navigate("/kiosk/complete"); } catch { setError(t("common.error")); } finally { setGenerating(false); } };
  return <main className="screen documents-screen"><h1>{t("documents.title")}</h1><p>{t("documents.subtitle")}</p><label className="upload-box"><input type="file" accept="image/*,.pdf" capture="environment" onChange={(event) => { const selected = event.target.files?.[0]; if (selected) void upload(selected); }} /><span>📄</span><strong>{t("documents.upload")}</strong><small>{t("documents.uploadDetail")}</small></label>
    {status === "processing" && <p className="processing" role="status">{t("documents.processing")}</p>}
    {file && preview && <img className="document-preview" src={preview} alt={t("documents.preview")} />}
    {status === "done" && <pre className="extracted-data">{JSON.stringify(data, null, 2)}</pre>}
    {error && <p className="form-error" role="alert">{error}</p>}<div className="answer-actions"><button className="button button-outline" disabled={status === "processing" || generating} onClick={() => void continueFlow()}>{generating ? t("common.pleaseWait") : t("documents.skip")}</button>{status === "done" && <button className="button button-primary" disabled={generating} onClick={() => void continueFlow()}>{generating ? t("common.pleaseWait") : t("documents.continue")}</button>}</div>
  </main>;
}
