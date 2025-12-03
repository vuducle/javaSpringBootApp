'use client';

import { useTranslation } from '@/context/LanguageContext';
import { useEffect, useState } from 'react';
import StatusPlaceholder from '@/components/ui/StatusPlaceholder';

type QuoteKeys = `q${1 | 2 | 3 | 4 | 5}`;
type ProverbKeyBase =
  | 'de1'
  | 'de2'
  | 'vi1'
  | 'vi2'
  | 'en1'
  | 'en2'
  | 'id1'
  | 'id2';
type ProverbKeys = `proverbs.${ProverbKeyBase}`;
type ProverbAuthorKeys = `proverbs.${ProverbKeyBase}_author`;
type ProverbOriginalKeys = `proverbs.${ProverbKeyBase}_original`;

export default function QuoteCard() {
  const { t, locale } = useTranslation();
  const [quoteData, setQuoteData] = useState<{
    quote: string;
    originalQuote: string;
    author: string;
  }>({
    quote: '',
    originalQuote: '',
    author: '',
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const quotesKeys: QuoteKeys[] = ['q1', 'q2', 'q3', 'q4', 'q5'];
    const proverbsKeys = [
      { key: 'de1', lang: 'de' },
      { key: 'de2', lang: 'de' },
      { key: 'vi1', lang: 'vi' },
      { key: 'vi2', lang: 'vi' },
      { key: 'en1', lang: 'en' },
      { key: 'en2', lang: 'en' },
      { key: 'id1', lang: 'id' },
      { key: 'id2', lang: 'id' },
    ];

    const isQuote = Math.random() < 0.5; // 50% chance to pick a quote vs a proverb

    let selectedQuote = '';
    let selectedOriginalQuote = '';
    let selectedAuthor = '';

    if (isQuote) {
      const randomKey =
        quotesKeys[Math.floor(Math.random() * quotesKeys.length)];
      selectedQuote = t(`quotes.${randomKey}`);
    } else {
      const randomProverb =
        proverbsKeys[Math.floor(Math.random() * proverbsKeys.length)];
      selectedQuote = t(
        `proverbs.${randomProverb.key}` as ProverbKeys
      );
      selectedAuthor = t(
        `proverbs.${randomProverb.key}_author` as ProverbAuthorKeys
      );

      if (randomProverb.lang !== locale) {
        selectedOriginalQuote = t(
          `proverbs.${randomProverb.key}_original` as ProverbOriginalKeys
        );
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuoteData({
      quote: selectedQuote,
      originalQuote: selectedOriginalQuote,
      author: selectedAuthor,
    });
    setLoading(false);
  }, [locale, t]);

  if (loading) {
    return (
      <StatusPlaceholder
        loading
        loadingText={t('common.loading') ?? 'Lädt...'}
      />
    );
  }

  return (
    <div className="bg-white/60 dark:bg-zinc-800/50 backdrop-blur-md border border-white/20 dark:border-zinc-700/40 shadow-lg rounded-2xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-primary">
        💬 {t('quotes.quoteCardTitle')}
      </h2>
      <blockquote className="text-lg italic text-zinc-800 dark:text-zinc-100 border-l-4 pl-4 border-primary/30">
        &quot;{quoteData.quote}&quot;
        {quoteData.originalQuote && (
          <span className="block text-sm text-gray-500 dark:text-gray-300 mt-1">
            ({quoteData.originalQuote})
          </span>
        )}
        {quoteData.author && (
          <cite className="block text-right not-italic text-sm mt-2">
            - {quoteData.author}
          </cite>
        )}
      </blockquote>
    </div>
  );
}
