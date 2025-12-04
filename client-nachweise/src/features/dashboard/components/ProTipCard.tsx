'use client';

import { useTranslation } from '@/context/LanguageContext';
import { useEffect, useState } from 'react';
import StatusPlaceholder from "@/components/ui/StatusPlaceholder";

type ProTipKeys = `proTips.${'tip1' | 'tip2' | 'tip3' | 'tip4' | 'tip5'}`;

export default function ProTipCard() {
  const { t, locale } = useTranslation();
  const [tip, setTip] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tipKeys: ProTipKeys[] = ['proTips.tip1', 'proTips.tip2', 'proTips.tip3', 'proTips.tip4', 'proTips.tip5'];
    const randomKey = tipKeys[Math.floor(Math.random() * tipKeys.length)];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTip(t(randomKey));
    setLoading(false);
  }, [t, locale]);

    if (loading) {
        return (
            <StatusPlaceholder
                loading
                loadingText={t('common.loading') ?? 'Lädt...'}
            />
        );
    }

  return (
    <div className="bg-white dark:bg-zinc-800 shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">{t('proTips.proTipCardTitle')}</h2>
      <p className="text-lg">
        {tip}
      </p>
    </div>
  );
}
