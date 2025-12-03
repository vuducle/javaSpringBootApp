'use client';

import { useTranslation } from '@/context/LanguageContext';
import { useAppSelector } from '@/store';
import { selectUser } from '@/store/slices/userSlice';

export default function TraineeDashboard() {
  const user = useAppSelector(selectUser);
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-background dark:bg-zinc-800">
      <header className="flex w-full items-center justify-end p-4 gap-2"></header>
      <main className="flex grow w-full max-w-3xl flex-col items-center justify-center bg-white dark:bg-zinc-800">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-primary">
            {t('dashboard.traineeWelcome').replace('{name}', user.name ?? '')}
          </h1>
        </div>
      </main>
    </div>
  );
}
