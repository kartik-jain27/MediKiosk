import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SiteFooter, SiteHeader } from "@/apps/shared/components/SiteFrame";
import { useSessionStore } from "@/lib/stores/sessionStore";

export function KioskLayout() {
  const location = useLocation();
  const { i18n } = useTranslation();
  const language = useSessionStore((state) => state.language);
  useEffect(() => { void i18n.changeLanguage(language); }, [i18n, language]);
  const compactFooter = ["/kiosk/interview", "/kiosk/documents", "/kiosk/alert"].includes(location.pathname);
  return <div className="kiosk-shell site-shell"><SiteHeader /><Outlet /><SiteFooter compact={compactFooter} /></div>;
}
