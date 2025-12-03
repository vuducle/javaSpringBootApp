import type { Metadata } from 'next';
import { NachweiseView } from '@/features/nachweise/NachweiseView';

export const metadata: Metadata = {
  title: 'Nachweise anschauen',
};

export default function NachweiseAnschauenPage() {
  return <NachweiseView />;
}