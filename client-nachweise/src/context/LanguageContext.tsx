
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import de from '@/locales/de.json';
import en from '@/locales/en.json';

const translations = { de, en };

const LanguageContext = createContext<{
  t: (key: string) => string;
  setLocale: (locale: 'de' | 'en') => void;
  locale: 'de' | 'en';
}>({
  t: () => '',
  setLocale: () => {},
  locale: 'de',
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<'de' | 'en'>('de');

  useEffect(() => {
    const cookieLocale = Cookies.get('locale') as 'de' | 'en';
    if (cookieLocale && translations[cookieLocale]) {
      setLocale(cookieLocale);
    } else {
      const browserLocale = navigator.language.split('-')[0] as 'de' | 'en';
      setLocale(translations[browserLocale] ? browserLocale : 'de');
    }
  }, []);

  const t = (key: string) => {
    const keys = key.split('.');
    let result: any = translations[locale];
    for (const k of keys) {
      result = result?.[k];
    }
    return result || key;
  };

  const handleSetLocale = (newLocale: 'de' | 'en') => {
    setLocale(newLocale);
    Cookies.set('locale', newLocale, { expires: 365 });
  };

  return (
    <LanguageContext.Provider value={{ t, setLocale: handleSetLocale, locale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
