'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/context/LanguageContext';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white/60 dark:bg-muted backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-8 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-40 h-40">
            <Image
              src="https://http.cat/404"
              alt="404"
              fill
              className="rounded-full scale-[1.02]"
            />
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            {t('notFound.title')}
          </h1>

          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-xl">
            {t('notFound.subtitle')}
          </p>

          <div className="flex gap-3 mt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-5 py-3 shadow-md hover:opacity-95"
            >
              <span className="text-sm font-semibold">
                {t('notFound.backHome')}
              </span>
            </Link>

            <Link
              href="/nachweise-anschauen"
              className="inline-flex items-center gap-2 rounded-lg border border-white/40 bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary/80"
            >
              {t('notFound.viewRecords')}
            </Link>
          </div>

          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {t('notFound.hint')}
          </p>
        </div>
      </div>
    </div>
  );
}
