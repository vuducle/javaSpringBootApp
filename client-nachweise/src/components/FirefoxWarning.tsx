'use client';

import { useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

const FirefoxWarning = () => {
  const { t } = useTranslation();
  
  // Check if browser is Firefox
  const userAgent = typeof window !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
  const isFirefox = userAgent.indexOf('firefox') > -1;
  
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('firefox-warning-dismissed') === 'true';
    }
    return false;
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('firefox-warning-dismissed', 'true');
  };

  if (!isFirefox || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full px-4">
      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-600 shadow-lg">
        <div className="p-4 flex items-start gap-3">
          <div className="shrink-0">
            <svg
              className="h-6 w-6 text-yellow-600 dark:text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
              {t('firefoxWarning.title')}
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              {t('firefoxWarning.message')}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="shrink-0 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </Card>
    </div>
  );
};

export default FirefoxWarning;
