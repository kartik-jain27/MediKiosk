import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { StructuredSummary } from "@/types/api";
import { api } from "@/lib/api/client";
import { useSessionStore } from "@/lib/stores/sessionStore";

const departments: { id: string; mode: StructuredSummary["mode"] }[] = [
  { id: "kayachikitsa", mode: "ayush" },
  { id: "panchakarma", mode: "ayush" },
  { id: "swasthavritta", mode: "ayush" },
  { id: "general", mode: "general" },
];

export function ModeSelect() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { patientId, departmentId, setDepartmentId, setMode, setInterview } = useSessionStore();
  const selection = departments.find((department) => department.id === departmentId) ?? null;
  const [error, setError] = useState("");
  const continueToInterview = async () => {
    if (!selection) return;
    if (!patientId) { navigate("/staff/dashboard", { replace: true }); return; }
    try { const start = await api.startInterview({ patientId, mode: selection.mode }); setMode(selection.mode); setInterview(start.interviewId, start.question); navigate("/kiosk/interview"); } catch { setError(t("common.error")); }
  };
  return <main className="screen mode-screen"><h1>{t("mode.title")}</h1><p>{t("mode.subtitle")}</p>
    <section className="department-grid">{departments.map((department) => <button key={department.id} className={`department-card ${selection?.id === department.id ? "selected" : ""}`} onClick={() => setDepartmentId(department.id)} aria-pressed={selection?.id === department.id}><span>{department.mode === "ayush" ? t("mode.ayush") : t("mode.general")}</span><strong>{t(`mode.departments.${department.id}.name`)}</strong><small>{t(`mode.departments.${department.id}.detail`)}</small></button>)}</section>
    {error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary" disabled={!selection} onClick={() => void continueToInterview()}>{t("common.continue")}</button>
  </main>;
}
