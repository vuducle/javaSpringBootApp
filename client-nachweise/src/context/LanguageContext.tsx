
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import de from '@/locales/de.json';
import en from '@/locales/en.json';

const translations = { de, en };

type Translations = typeof de | typeof en;

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
  const [locale, setLocale] = useState<'de' | 'en'>(() => {
    if (typeof window === 'undefined') {
      return 'de'; // Server-side rendering, default to 'de'
    }
    const cookieLocale = Cookies.get('locale') as 'de' | 'en';
    if (cookieLocale && translations[cookieLocale]) {
      return cookieLocale;
    } else {
      const browserLocale = navigator.language.split('-')[0] as 'de' | 'en';
      return translations[browserLocale] ? browserLocale : 'de';
    }
  });

  useEffect(() => {
    // This useEffect is now only for potential future updates or side effects
    // The initial locale is set during useState initialization
  }, []);

  const t = (key: string) => {
    const keys = key.split('.');
    let result: string | Translations | undefined = translations[locale];
    for (const k of keys) {
        if (typeof result === 'object' && result !== null) {
            result = (result as Translations)[k as keyof Translations];
        }
    }
    return typeof result === 'string' ? result : key;
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
