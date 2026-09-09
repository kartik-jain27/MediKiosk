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
  const results = useMemo(() => {
    const matches = searchDoctors(query);
    const favorite = doctors.find((doctor) => doctor.doctorId === staff?.favoriteDoctorId);
    return favorite ? [favorite, ...matches.filter((doctor) => doctor.doctorId !== favorite.doctorId)] : matches;
  }, [doctors, query, searchDoctors, staff?.favoriteDoctorId]);
  const toggleFavorite = (doctor: DoctorProfile) => {
    if (!staff) return;
    const updated = { ...staff, favoriteDoctorId: staff.favoriteDoctorId === doctor.doctorId ? undefined : doctor.doctorId };
    updateStaff(updated);
    login("staff", updated);
  };
  return <div className="doctor-search"><label>Find a doctor<input role="combobox" aria-expanded="true" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or Doctor ID" /></label><div className="doctor-results">{results.map((doctor) => <div className="doctor-result" key={doctor.doctorId}><button className="doctor-result-select" onClick={() => onSelect(doctor)}><strong>{doctor.name}</strong><span>{doctor.doctorId} · {doctor.hospitalPosting}</span></button>{staff && <button className="favorite-button" aria-label={`Toggle favorite for ${doctor.name}`} aria-pressed={staff.favoriteDoctorId === doctor.doctorId} onClick={() => toggleFavorite(doctor)}>{staff.favoriteDoctorId === doctor.doctorId ? "★" : "☆"}</button>}</div>)}{!results.length && <p>No doctors match this search.</p>}</div></div>;
}
