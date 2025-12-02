
"use client";

import { useTranslation } from "@/context/LanguageContext";
import { Button } from "./button";
import {Flag} from "lucide-react";

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
