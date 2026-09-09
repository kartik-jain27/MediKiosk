import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/stores/authStore";
import { useDoctorQueueStore } from "@/lib/stores/doctorQueueStore";

const priorityOrder = { critical: 0, urgent: 1, normal: 2 };

export function Queue() {
  const navigate = useNavigate();
  const doctor = useAuthStore((state) => state.currentDoctor);
  const items = useDoctorQueueStore((state) => state.items);
  const queue = useMemo(() => items.filter((item) => item.doctorId === doctor?.doctorId).sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]), [doctor?.doctorId, items]);
  useEffect(() => { const sync = (event: StorageEvent) => { if (event.key === "medikiosk-doctor-queue") void useDoctorQueueStore.persist.rehydrate(); }; window.addEventListener("storage", sync); return () => window.removeEventListener("storage", sync); }, []);
  const priorityCount = queue.filter((item) => item.priority !== "normal" && item.status === "pending").length;
  return <main className="doctor-page"><div className="doctor-page-heading"><div><p className="doctor-kicker">Clinical queue</p><h1>Patient intake review</h1></div><span>{queue.filter((item) => item.status === "pending").length} awaiting review</span></div>
    <section className={`priority-queue ${priorityCount ? "has-priority" : ""}`}><strong>{priorityCount ? `${priorityCount} Priority Patient${priorityCount === 1 ? "" : "s"} Waiting` : "No priority patients waiting"}</strong><span>{priorityCount ? "Review their intake promptly and follow local escalation protocols." : "New high-priority alerts will appear here."}</span></section>
    <section className="queue-table" aria-label="Patient queue"><div className="queue-head"><span>Patient</span><span>Priority</span><span>Status</span></div>{queue.map((item) => <button key={item.id} className="queue-row doctor-queue-row" onClick={() => navigate(`/doctor/summary/${item.patientId}`)}><strong>{item.patientName}</strong><span className={`queue-priority ${item.priority}`}>{item.priority}</span><span className={`queue-status ${item.status}`}>{item.status}</span></button>)}{!queue.length && <p className="empty-queue">No patients have been assigned to your queue.</p>}</section>
  </main>;
}
