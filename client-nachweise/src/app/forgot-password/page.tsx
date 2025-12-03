import ForgotPassword from '@/features/auth/ForgotPassword';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Passwort vergessen',
};

export default function ForgotPasswordPage() {
  return <ForgotPassword />;
}
