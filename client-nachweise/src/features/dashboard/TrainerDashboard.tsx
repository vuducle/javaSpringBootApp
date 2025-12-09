'use client';

import { useTranslation } from '@/context/LanguageContext';
import { useAppSelector } from '@/store';
import { selectUser } from '@/store/slices/userSlice';
import FeaturesModal from '@/components/core/FeaturesModal';
import ProfileCard from './components/ProfileCard';
import ProTipCard from './components/ProTipCard';
import TrainerStatsCard from './components/TrainerStatsCard';
import AuditTrail from './components/AuditTrail';
import CatGIF from '@/features/dashboard/components/CatGIF';

export default function TrainerDashboard() {
  const user = useAppSelector(selectUser);
  const { t } = useTranslation();

  return (
    <div className="flex container mx-auto flex-col min-h-[calc(100vh-4rem)]  p-4">
      <header className="flex w-full items-center justify-between p-4 bg-white dark:bg-zinc-800 shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-primary">
          {t('dashboard.trainerWelcomeFormal').replace(
            '{name}',
            user.name ?? ''
          )}
        </h1>
        <FeaturesModal />
      </header>
      <main className="flex grow w-full flex-col gap-4 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <TrainerStatsCard />
            <AuditTrail />
          </div>
          <div className="flex flex-col gap-4">
            <ProfileCard />
            <ProTipCard />
            <CatGIF />
          </div>
        </div>
      </main>
    </div>
  );
}
