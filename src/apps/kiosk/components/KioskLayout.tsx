import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSessionStore } from "@/lib/stores/sessionStore";

export function KioskLayout() {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const { language, setLanguage, reset } = useSessionStore();

  useEffect(() => { void i18n.changeLanguage(language); }, [i18n, language]);

  const changeLanguage = (next: "en" | "hi") => {
    setLanguage(next);
  };

  return (
    <div className="kiosk-shell">
      <header className="kiosk-header">
        <button className="brand" onClick={() => { reset(); navigate("/kiosk"); }} aria-label="Return to MediKiosk start">MediKiosk</button>
        <div className="language-toggle" aria-label="Language selection">
          <button className={language === "en" ? "active" : ""} onClick={() => changeLanguage("en")} aria-pressed={language === "en"}>English</button>
          <button className={language === "hi" ? "active" : ""} onClick={() => changeLanguage("hi")} aria-pressed={language === "hi"}>हिन्दी</button>
        </div>
      </header>
      <Outlet />
      <footer className="kiosk-footer">{t("shell.footer")}</footer>
    </div>
  );
}
