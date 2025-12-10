'use client';

import React from 'react';

type Props = {
  loading?: boolean;
  error?: boolean | string;
  errorImage?: string;
  className?: string;
  loadingText?: string;
  errorText?: string;
};

export default function StatusPlaceholder({
  loading,
  error,
  errorImage = 'https://http.cat/status/400',
  className = '',
  loadingText = 'Lade...',
  errorText = 'Fehler beim Laden',
}: Props) {
  if (loading) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-6 ${className}`}
      >
        <div className="w-12 h-12 border-4 border-t-primary rounded-full animate-spin" />
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
          {loadingText}
        </p>
      </div>
    );
  }

  if (error) {
    const message = typeof error === 'string' ? error : errorText;
    return (
      <div
        className={`flex flex-col items-center justify-center p-6 ${className}`}
      >
        <picture>
          <img
            src={errorImage}
            alt="error"
            className="w-48 max-w-full rounded-lg shadow-md object-contain"
          />
        </picture>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300 text-center">
          {message}
        </p>
      </div>
    );
  }

  return null;
}
