import { useTranslation } from "react-i18next";
import { useSessionStore } from "@/lib/stores/sessionStore";

export function Complete() {
  const { t } = useTranslation();
  const summaryId = useSessionStore((state) => state.summaryId);
  return <main className="screen complete-screen"><span aria-hidden="true">✓</span><h1>{t("complete.title")}</h1><p>{t("complete.subtitle")}</p><p className="reference">{t("complete.reference")}: <strong>{summaryId ? `MK-${summaryId.slice(0, 8).toUpperCase()}` : "MK-PENDING"}</strong></p></main>;
}
