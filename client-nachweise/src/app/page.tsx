import type { Metadata } from 'next';
import HomePage from './HomePage';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function Home() {
  return <HomePage />;
}
