'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { useTranslation } from '@/context/LanguageContext';

export function CookieBanner() {
  const { t } = useTranslation();
  const cookieConsent = 'CookieConsentDenisKunzLiebtJava';
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false; // Server-side rendering, hide by default
    }
    const consent = localStorage.getItem(cookieConsent);
    return !consent;
  });

  const handleAccept = () => {
    localStorage.setItem(cookieConsent, 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="mx-auto max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle>{t('cookieBanner.title')}</CardTitle>
          <CardDescription>
            {t('cookieBanner.description')}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-end">
          <Button onClick={handleAccept}>
            {t('cookieBanner.acceptButton')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
