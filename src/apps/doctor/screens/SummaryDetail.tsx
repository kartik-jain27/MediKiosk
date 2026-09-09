import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import type { StructuredSummary, TimelineEntry } from "@/types/api";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/authStore";
import { useDoctorQueueStore } from "@/lib/stores/doctorQueueStore";

const sections: { key: keyof StructuredSummary["sections"]; label: string }[] = [
  { key: "chiefComplaint", label: "Chief Complaint" }, { key: "hpi", label: "HPI" }, { key: "pastMedicalHistory", label: "Past Medical History" }, { key: "pastSurgicalHistory", label: "Past Surgical History" }, { key: "medications", label: "Medications" }, { key: "allergies", label: "Allergies" }, { key: "familyHistory", label: "Family History" }, { key: "personalHistory", label: "Personal History" }, { key: "reviewOfSystems", label: "Review of Systems" },
];

export function SummaryDetail() {
  const { patientId } = useParams();
  const role = useAuthStore((state) => state.role);
  const doctor = useAuthStore((state) => state.currentDoctor);
  const queueItems = useDoctorQueueStore((state) => state.items);
  const updateDiagnosis = useDoctorQueueStore((state) => state.updateDiagnosis);
  const markDiagnosed = useDoctorQueueStore((state) => state.markDiagnosed);
  const timers = useRef<Record<string, number>>({});
  const [summary, setSummary] = useState<StructuredSummary | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [edited, setEdited] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [diagnosisSubmitted, setDiagnosisSubmitted] = useState(false);
  useEffect(() => { if (role !== "doctor" || !patientId) return; void Promise.all([api.getDoctorSummary(patientId), api.getTimeline(patientId)]).then(([record, entries]) => { setSummary(record); setTimeline(entries); }).catch(() => setError("Could not load this patient summary.")); const pendingTimers = timers.current; return () => Object.values(pendingTimers).forEach(window.clearTimeout); }, [patientId, role]);
  const edit = (section: keyof StructuredSummary["sections"], content: string) => {
    if (!summary || summary.status === "approved") return;
    const next = { ...summary, sections: { ...summary.sections, [section]: content } };
    setSummary(next); setEdited((items) => items.includes(section) ? items : [...items, section]);
    window.clearTimeout(timers.current[section]);
    timers.current[section] = window.setTimeout(() => { void api.updateSummary(next.id, { section, content }).then((saved) => setSummary((current) => current?.sections[section] === content ? { ...current, status: saved.status, sections: { ...current.sections, [section]: saved.sections[section] } } : current)).catch(() => setError("Could not save that section.")); }, 500);
  };
  const approve = async () => { if (!summary) return; Object.values(timers.current).forEach(window.clearTimeout); try { for (const { key } of sections.filter(({ key }) => edited.includes(key))) await api.updateSummary(summary.id, { section: key, content: summary.sections[key] }); setSummary(await api.approveSummary(summary.id)); } catch { setError("Could not approve this summary."); } };
  const queueItem = queueItems.find((item) => item.patientId === patientId && item.doctorId === doctor?.doctorId);
  useEffect(() => { setDiagnosis(queueItem?.diagnosis ?? ""); setDiagnosisSubmitted(queueItem?.status === "diagnosed"); }, [queueItem?.diagnosis, queueItem?.status]);
  const submitDiagnosis = () => { if (!queueItem || !diagnosis.trim()) return; updateDiagnosis(queueItem.id, diagnosis.trim()); markDiagnosed(queueItem.id); setDiagnosisSubmitted(true); };
  if (!summary) return <main className="doctor-page"><p>{error || "Loading patient summary..."}</p></main>;
  const locked = summary.status === "approved";
  return <main className="doctor-page summary-page"><div className="doctor-page-heading"><div><p className="doctor-kicker">Patient summary</p><h1>{locked ? "Approved clinical record" : "Review intake summary"}</h1></div><button className="approve-button" disabled={locked} onClick={() => void approve()}>{locked ? "Approved" : "Approve record"}</button></div>
    {error && <p className="doctor-error" role="alert">{error}</p>}<section className="timeline"><h2>Medical timeline</h2>{timeline.map((entry) => <div key={`${entry.date}-${entry.label}`}><time>{new Date(entry.date).toLocaleDateString()}</time><span>{entry.label}</span></div>)}</section>
    {summary.mode === "ayush" && <section className="summary-section ayush-section"><div><h2>AYUSH-specific data</h2><span className="ai-badge">AI-generated, please verify</span></div><p>Prakriti, Vikriti, and Agni details will appear here when captured during AYUSH intake.</p></section>}
    <section className="summary-grid">{sections.map(({ key, label }) => <article className="summary-section" key={key}><div><h2>{label}</h2>{!locked && !edited.includes(key) && <span className="ai-badge">AI-generated, please verify</span>}{locked && <span className="approved-badge">Approved</span>}</div><textarea value={summary.sections[key]} disabled={locked} onChange={(event) => edit(key, event.target.value)} aria-label={label} /></article>)}</section>
    <section className="final-diagnosis"><h2>Final Diagnosis &amp; Conclusion</h2><textarea value={diagnosis} disabled={!queueItem || diagnosisSubmitted} onChange={(event) => setDiagnosis(event.target.value)} placeholder="Write the clinical conclusion" /><label>Diagnosis attachment (optional)<input type="file" onChange={(event) => setAttachmentName(event.target.files?.[0]?.name ?? "")} /></label>{attachmentName && <p>{attachmentName}</p>}<button disabled={!queueItem || !diagnosis.trim() || diagnosisSubmitted} onClick={submitDiagnosis}>{diagnosisSubmitted ? "Diagnosis submitted" : "Submit Diagnosis"}</button>{diagnosisSubmitted && <p className="assignment-confirmation" role="status">Diagnosis submitted to the patient record.</p>}</section>
  </main>;
}
