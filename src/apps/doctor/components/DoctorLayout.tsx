import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/stores/authStore";
import { useSessionStore } from "@/lib/stores/sessionStore";

export function DoctorLayout() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const setDoctorSession = useSessionStore((state) => state.setDoctorSession);
  return <div className="doctor-shell"><header className="doctor-header"><button onClick={() => navigate("/doctor/queue")}>MediKiosk <span>Clinical Review</span></button><button className="doctor-logout" onClick={() => { logout(); setDoctorSession(false); navigate("/doctor/login"); }}>Sign out</button></header><Outlet /></div>;
}
