import type { Metadata } from 'next';
import AboutPage from '@/features/info/AboutPage';

export const metadata: Metadata = {
  title: 'Über uns',
  description:
    'Erfahre mehr über NachweisWelt und die digitale Lösung für Ausbildungsnachweise',
};

export default function About() {
  return <AboutPage />;
}
