import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSessionStore } from "@/lib/stores/sessionStore";

const institute = import.meta.env.VITE_INSTITUTE_NAME ?? "All India Institute of Ayurveda (AIIA)";

export function Landing() {
  const { t } = useTranslation();
  const speak = useTextToSpeech();
  const language = useSessionStore((state) => state.language);
  const title = t("publicLanding.title");
  const subtitle = t("publicLanding.subtitle");

  return <main className="landing-page">
    <section className="landing-hero">
      <div className="landing-hero-content"><span className="eyebrow">{t("publicLanding.badge")}</span><h1>{title}</h1><p>{subtitle}</p><div className="hero-actions"><button className="button hero-listen" onClick={() => speak(`${title}. ${subtitle}`, language)}>{t("common.listen")}</button></div><div className="hero-meta"><span><strong>{institute}</strong><small>{t("publicLanding.heroMeta")}</small></span><span><strong>{t("publicLanding.physicianReview")}</strong><small>{t("publicLanding.heroReviewMeta")}</small></span></div></div>
    </section>
    <section className="landing-content public-info">
      <div className="service-intro"><div><p className="section-kicker">{t("publicLanding.howKicker")}</p><h2>{t("publicLanding.howTitle")}</h2></div><p>{t("publicLanding.howCopy")}</p></div>
      <div className="service-grid" aria-label={t("publicLanding.servicesLabel")}><section className="service-link"><strong>{t("publicLanding.staffTitle")}</strong><span>{t("publicLanding.staffCopy")}</span><Link to="/staff/login">{t("publicLanding.staffLink")}</Link></section><section className="service-link"><strong>{t("publicLanding.doctorTitle")}</strong><span>{t("publicLanding.doctorCopy")}</span><Link to="/doctor/access">{t("publicLanding.doctorLink")}</Link></section><section className="service-link"><strong>{t("publicLanding.recordsTitle")}</strong><span>{t("publicLanding.recordsCopy")}</span></section><section className="service-link"><strong>{t("publicLanding.safetyTitle")}</strong><span>{t("publicLanding.safetyCopy")}</span></section></div>
    </section>
  </main>;
}
