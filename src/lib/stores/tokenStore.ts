import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { generateToken } from "@/lib/generateId";
import type { PatientToken } from "@/types/rbac";

interface TokenState {
  tokens: PatientToken[];
  generateToken: (staffId: string, draft?: PatientToken["patientDraft"]) => PatientToken;
  redeemToken: (token: string) => PatientToken | null;
}

export const useTokenStore = create<TokenState>()(persist((set, get) => ({
  tokens: [],
  generateToken: (staffId, patientDraft) => {
    let token = generateToken();
    while (get().tokens.some((item) => item.token === token)) token = generateToken();
    const issued: PatientToken = { token, issuedByStaffId: staffId, patientDraft, status: "issued", createdAt: new Date().toISOString() };
    set((state) => ({ tokens: [...state.tokens, issued] }));
    return issued;
  },
  redeemToken: (token) => {
    const current = get().tokens.find((item) => item.token === token.trim().toUpperCase() && item.status === "issued");
    if (!current) return null;
    const redeemed = { ...current, status: "redeemed" as const };
    set((state) => ({ tokens: state.tokens.map((item) => item.token === redeemed.token ? redeemed : item) }));
    return redeemed;
  },
}), { name: "medikiosk-tokens", storage: createJSONStorage(() => localStorage) }));
