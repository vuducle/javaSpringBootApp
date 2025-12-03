import type { Metadata } from 'next';
import { CreateNachweisForm } from '@/features/nachweise/CreateNachweisForm';

export const metadata: Metadata = {
  title: 'Nachweis erstellen',
};

export default function ErstellenPage() {
  return <CreateNachweisForm />;
}