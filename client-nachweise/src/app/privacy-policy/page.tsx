import type { Metadata } from 'next';
import PrivacyPolicyPageClient from './PrivacyPolicyPageClient';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung',
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyPageClient />;
}
