'use client';

// client-nachweise/src/app/privacy-policy/page.tsx
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/LanguageContext'; // Assuming useTranslation is available here

export default function PrivacyPolicyPageClient() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl rounded-lg bg-card p-8 shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-primary">
          {t('privacyPolicy.title')}
        </h1>

        <section className="mb-6">
          <h2 className="mb-3 text-2xl font-semibold text-primary">
            {t('privacyPolicy.section1.title')}
          </h2>
          <p className="mb-2 text-muted-foreground">
            {t('privacyPolicy.section1.paragraph1')}
          </p>
          <p className="mb-2 text-muted-foreground">
            {t('privacyPolicy.section1.paragraph2')}
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-2xl font-semibold text-primary">
            {t('privacyPolicy.section2.title')}
          </h2>
          <p className="mb-2 text-muted-foreground">
            {t('privacyPolicy.section2.paragraph1')}
          </p>
          <ul className="mb-2 ml-5 list-disc text-muted-foreground">
            <li>{t('privacyPolicy.section2.listItem1')}</li>
            <li>{t('privacyPolicy.section2.listItem2')}</li>
            <li>{t('privacyPolicy.section2.listItem3')}</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-2xl font-semibold text-primary">
            {t('privacyPolicy.section3.title')}
          </h2>
          <p className="mb-2 text-muted-foreground">
            {t('privacyPolicy.section3.paragraph1')}
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-2xl font-semibold text-primary">
            {t('privacyPolicy.section4.title')}
          </h2>
          <p className="mb-2 text-muted-foreground">
            {t('privacyPolicy.section4.paragraph1')}
          </p>
        </section>

        <div className="mt-8 text-center">
          <Link href="/" passHref>
            <Button>{t('privacyPolicy.backToHome')}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
