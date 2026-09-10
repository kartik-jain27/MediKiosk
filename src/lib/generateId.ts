const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const code = (prefix: string, length: number) => `${prefix}${Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")}`;

export const generateDoctorId = () => code("DOC-", 5);
export const generateStaffId = () => code("STF-", 5);
export const generatePatientId = () => code("PT-", 6);
