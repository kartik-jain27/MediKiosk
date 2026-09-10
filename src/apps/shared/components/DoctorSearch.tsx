import { useMemo, useState } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useDirectoryStore } from "@/lib/stores/directoryStore";
import type { DoctorProfile } from "@/types/rbac";

export function DoctorSearch({ onSelect }: { onSelect: (doctor: DoctorProfile) => void }) {
  const doctors = useDirectoryStore((state) => state.doctors);
  const searchDoctors = useDirectoryStore((state) => state.searchDoctors);
  const updateStaff = useDirectoryStore((state) => state.updateStaff);
  const staff = useAuthStore((state) => state.currentStaff);
  const login = useAuthStore((state) => state.login);
  const [query, setQuery] = useState("");
  const savedIds = useMemo(() => staff?.favoriteDoctorIds ?? (staff?.favoriteDoctorId ? [staff.favoriteDoctorId] : []), [staff?.favoriteDoctorId, staff?.favoriteDoctorIds]);
  const results = useMemo(() => {
    const matches = searchDoctors(query).filter((doctor) => doctor.hospitalPosting === staff?.hospitalPosting);
    const saved = doctors.filter((doctor) => savedIds.includes(doctor.doctorId) && doctor.hospitalPosting === staff?.hospitalPosting);
    return [...saved, ...matches.filter((doctor) => !saved.some((item) => item.doctorId === doctor.doctorId))];
  }, [doctors, query, savedIds, searchDoctors, staff?.hospitalPosting]);
  const toggleFavorite = (doctor: DoctorProfile) => {
    if (!staff) return;
    const saved = staff.favoriteDoctorIds ?? (staff.favoriteDoctorId ? [staff.favoriteDoctorId] : []);
    const updated = { ...staff, favoriteDoctorId: undefined, favoriteDoctorIds: saved.includes(doctor.doctorId) ? saved.filter((id) => id !== doctor.doctorId) : [...saved, doctor.doctorId] };
    updateStaff(updated);
    login("staff", updated);
  };
  return <div className="doctor-search"><label>Find a doctor in your hospital<input role="combobox" aria-expanded="true" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or Doctor ID" /></label><div className="doctor-results">{results.map((doctor) => <div className="doctor-result" key={doctor.doctorId}><button className="doctor-result-select" onClick={() => onSelect(doctor)}><strong>{doctor.name}</strong><span>{doctor.doctorId} · {doctor.hospitalPosting}</span></button>{staff && <button className="favorite-button" aria-label={`Save ${doctor.name}`} aria-pressed={savedIds.includes(doctor.doctorId)} onClick={() => toggleFavorite(doctor)}>{savedIds.includes(doctor.doctorId) ? "★" : "☆"}</button>}</div>)}{!results.length && <p>No doctors from this hospital match the search.</p>}</div></div>;
}
