import { Navigate, Route, Routes } from "react-router-dom";
import { DoctorLayout } from "@/apps/doctor/components/DoctorLayout";
import { RequireRole } from "@/apps/shared/components/RequireRole";
import { StaffDashboard } from "@/apps/staff/screens/Dashboard";
import { StaffLogin } from "@/apps/staff/screens/Login";
import { StaffRegister } from "@/apps/staff/screens/Register";
import { Login } from "@/apps/doctor/screens/Login";
import { Queue } from "@/apps/doctor/screens/Queue";
import { DoctorRegister } from "@/apps/doctor/screens/Register";
import { SummaryDetail } from "@/apps/doctor/screens/SummaryDetail";
import { KioskLayout } from "@/apps/kiosk/components/KioskLayout";
import { Alert } from "@/apps/kiosk/screens/Alert";
import { Complete } from "@/apps/kiosk/screens/Complete";
import { Consent } from "@/apps/kiosk/screens/Consent";
import { Documents } from "@/apps/kiosk/screens/Documents";
import { Interview } from "@/apps/kiosk/screens/Interview";
import { Landing } from "@/apps/kiosk/screens/Landing";
import { ModeSelect } from "@/apps/kiosk/screens/ModeSelect";
import { Register } from "@/apps/kiosk/screens/Register";

export default function App() {
  return (
    <Routes>
      <Route path="/kiosk" element={<KioskLayout />}>
        <Route index element={<Landing />} />
        <Route path="consent" element={<Consent />} />
        <Route path="register" element={<Register />} />
        <Route path="mode-select" element={<ModeSelect />} />
        <Route path="interview" element={<Interview />} />
        <Route path="alert" element={<Alert />} />
        <Route path="documents" element={<Documents />} />
        <Route path="complete" element={<Complete />} />
      </Route>
      <Route path="/staff/register" element={<StaffRegister />} />
      <Route path="/staff/login" element={<StaffLogin />} />
      <Route path="/staff/dashboard" element={<RequireRole role="staff"><StaffDashboard /></RequireRole>} />
      <Route path="/doctor/login" element={<Login />} />
      <Route path="/doctor/register" element={<DoctorRegister />} />
      <Route path="/doctor" element={<RequireRole role="doctor"><DoctorLayout /></RequireRole>}>
        <Route path="queue" element={<Queue />} />
        <Route path="summary/:patientId" element={<SummaryDetail />} />
      </Route>
      <Route path="*" element={<Navigate to="/kiosk" replace />} />
    </Routes>
  );
}
