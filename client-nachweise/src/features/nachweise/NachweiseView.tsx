'use client';

import { useAppSelector } from '@/store';
import { selectUser } from '@/store/slices/userSlice';
import { AllNachweiseView } from './AllNachweiseView';

export function NachweiseView() {
  return <AllNachweiseView />;
}
