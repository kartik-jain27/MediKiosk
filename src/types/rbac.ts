export interface DoctorProfile {
  doctorId: string;
  name: string;
  gender: string;
  email: string;
  phone: string;
  licenseNumber: string;
  hospitalPosting: string;
  verified: true;
}

export interface StaffProfile {
  staffId: string;
  name: string;
  gender: string;
  email: string;
  phone: string;
  hospitalPosting: string;
  governmentId: string;
  verified: true;
  favoriteDoctorId?: string;
}

export interface PatientToken {
  token: string;
  issuedByStaffId: string;
  patientDraft?: { name?: string; phone?: string; chiefComplaint?: string };
  status: "issued" | "redeemed";
  createdAt: string;
}

export interface DoctorQueueItem {
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  summaryId: string;
  priority: "normal" | "urgent" | "critical";
  status: "pending" | "diagnosed";
  diagnosis?: string;
  assignedAt: string;
}

export interface StaffAssignmentCandidate {
  patientId: string;
  patientName: string;
  summaryId: string;
  chiefComplaint: string;
  priority: DoctorQueueItem["priority"];
}
