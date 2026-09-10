export interface DoctorProfile {
  doctorId: string;
  name: string;
  gender: string;
  email: string;
  phone: string;
  licenseNumber: string;
  aadhaarLast4: string;
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
  favoriteDoctorIds?: string[];
}

export interface RegisteredPatient {
  medikioskId: string;
  name: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  aadhaarLast4: string;
  issuedByStaffId: string;
  priority: "normal" | "urgent";
  createdAt: string;
  latestIntakeId?: string;
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
