'use client';

import { useTranslation } from '@/context/LanguageContext';
import { Github } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggleButton } from './ThemeToggleButton';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full p-4 bg-background border-t border-border">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="text-sm text-muted-foreground">
          &copy; {currentYear} - NachweisWelt
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{t('footer.love')} ❤️</span>
          <span>🇻🇳</span>
          <span>☕</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggleButton />
          <a
            href="https://github.com/vuducle/javaSpringBootApp/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </a>
        </div>
      </div>
    </footer>
  );
}
