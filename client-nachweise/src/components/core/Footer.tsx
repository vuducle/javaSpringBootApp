'use client';

// client-nachweise/src/components/ui/Footer.tsx
import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggleButton } from './ThemeToggleButton';
import { Github } from 'lucide-react'; // Import Github icon

export function Footer() {
  const { t } = useTranslation();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-card p-4 text-center text-muted-foreground shadow-lg dark:bg-card">
      <div className="container mx-auto flex flex-col items-center justify-between gap-2 sm:flex-row">
        <div className="mx-automt-2 text-sm">
          <p>&copy; {currentYear} - NachweiseWelt - V.1.0.0</p>
        </div>
        <div className="mt-2 text-sm">
          <p>{t('footer.codedWithLove')}</p>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="https://github.com/vuducle/javaSpringBootApp/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:underline"
          >
            <Github className="h-5 w-5" /> {/* GitHub icon */}
          </Link>
          <Link
            href="/privacy-policy"
            className="text-sm hover:underline"
          >
            {t('footer.privacyPolicy')}
          </Link>
          <LanguageSwitcher />
          <ThemeToggleButton />
        </nav>
      </div>
    </footer>
  );
}
