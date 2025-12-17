'use client';

import { useTranslation } from '@/context/LanguageContext';
import { useAppSelector } from '@/store';
import { selectUser } from '@/store/slices/userSlice';

import ProfileCard from './components/ProfileCard';
import QuoteCard from './components/QuoteCard';
import StatsCard from './components/StatsCard';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Plus, Eye } from 'lucide-react';
import CatGIF from './components/CatGIF';
import FeaturesModal from '@/components/core/FeaturesModal';

export default function TraineeDashboard() {
  const user = useAppSelector(selectUser);
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] mx-auto p-4 container m-auto">
      <header className="flex w-full items-center justify-between p-4 bg-white dark:bg-zinc-800 shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-primary">
          {t('dashboard.traineeWelcome').replace(
            '{name}',
            user.name ?? ''
          )}
        </h1>
        <FeaturesModal />
      </header>
      <main className="flex grow w-full flex-col gap-4 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <StatsCard />
            <div className="bg-white/60 dark:bg-zinc-800/50 backdrop-blur-md border border-white/20 dark:border-zinc-700/40 shadow-lg rounded-2xl p-6 mt-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <FeaturesModal />
                <Button
                  onClick={() => router.push('/erstellen')}
                  className="w-full sm:w-auto"
                >
                  <Plus />
                  {t('nachweis.nachweisErstellen')}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push('/nachweise-anschauen')}
                  className="w-full sm:w-auto"
                >
                  <Eye />
                  {t('nachweis.nachweiseAnschauen')}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <ProfileCard />
            <QuoteCard />
            <CatGIF />
          </div>
        </div>
      </main>
    </div>
  );
}
