import type { Metadata } from 'next';
import EditNachweisPageClient from './EditNachweisPageClient';

export const metadata: Metadata = {
  title: 'Nachweis bearbeiten',
};

export default function EditNachweisPage() {
  return <EditNachweisPageClient />;
}
