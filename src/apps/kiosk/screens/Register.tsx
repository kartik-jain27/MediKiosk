import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { useSessionStore } from "@/lib/stores/sessionStore";

const schema = z.object({ name: z.string().trim().min(2), phone: z.string().regex(/^[6-9]\d{9}$/) });
type FormValues = z.infer<typeof schema>;

export function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language, priority, returning, setPatientId } = useSessionStore();
  const { register, handleSubmit, formState: { errors, isSubmitting, isValid } } = useForm<FormValues>({ resolver: zodResolver(schema), mode: "onChange" });
  const [error, setError] = useState("");
  const submit = async (values: FormValues) => {
    try { const patient = await api.createPatient({ ...values, language }); setPatientId(patient.id); navigate("/kiosk/consent"); } catch { setError(t("common.error")); }
  };

  return <main className="screen form-screen">
    {priority === "urgent" && <p className="priority-banner" role="status">⚠ {t("register.priority")}</p>}
    <p className="step-label">{returning ? t("register.returning") : t("register.newPatient")}</p>
    <h1>{t("register.title")}</h1><p>{t("register.subtitle")}</p>
    <form className="intake-form" onSubmit={handleSubmit(submit)}>
      <label>{t("register.name")}<input {...register("name")} autoComplete="name" /><small>{errors.name && t("register.nameError")}</small></label>
      <label>{t("register.phone")}<input {...register("phone")} inputMode="numeric" autoComplete="tel" /><small>{errors.phone && t("register.phoneError")}</small></label>
      {error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary" disabled={!isValid || isSubmitting}>{isSubmitting ? t("common.pleaseWait") : t("common.continue")}</button>
    </form>
  </main>;
}
