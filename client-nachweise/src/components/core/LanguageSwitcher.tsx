
"use client";

import { useTranslation } from "@/context/LanguageContext";
import { Button } from "../ui/button";

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  const toggleLocale = () => {
    setLocale(locale === "de" ? "en" : "de");
  };

  return (
    <Button variant="outline" size="icon" onClick={toggleLocale}>

      {locale.toUpperCase()}
    </Button>
  );
}
