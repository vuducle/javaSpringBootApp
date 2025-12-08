'use client';

import { useAppSelector } from '@/store';
import { selectUser } from '@/store/slices/userSlice';
import { AllNachweiseView } from './AllNachweiseView';
import { AdminNachweiseView } from './AdminNachweiseView';

export function NachweiseView() {
  const user = useAppSelector(selectUser);
  const isAdmin = !!user?.roles?.includes('ROLE_ADMIN');

  if (isAdmin) {
    return <AdminNachweiseView />;
  }

  return <AllNachweiseView />;
}
