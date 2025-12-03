'use client';

import { useAppSelector } from '@/store';
import { selectUser } from '@/store/slices/userSlice';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import TraineeDashboard from '@/features/dashboard/TraineeDashboard';
import TrainerDashboard from '@/features/dashboard/TrainerDashboard';

export default function HomePage() {
  const user = useAppSelector(selectUser);
  const router = useRouter();

  useEffect(() => {
    if (!user.isLoggedIn) {
      router.push('/login');
    }
  }, [user.isLoggedIn, router]);

  if (!user.isLoggedIn) {
    return null;
  }

  const isTrainee = user.roles?.includes('ROLE_USER');
  // const isTrainer = user.roles?.includes('ROLE_ADMIN');

  if (!user.isLoggedIn) {
    return null;
  }

  return isTrainee ? <TraineeDashboard /> : <TrainerDashboard />;
}
