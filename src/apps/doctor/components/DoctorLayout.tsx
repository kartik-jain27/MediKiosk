import { Link, Outlet } from "react-router-dom";
import { SiteFooter, SiteHeader } from "@/apps/shared/components/SiteFrame";

export function DoctorLayout() {
  return <div className="doctor-shell site-shell"><SiteHeader /><div className="clinical-context"><span>Clinical review workspace</span><Link to="/doctor/queue">Patient queue</Link></div><Outlet /><SiteFooter /></div>;
}
