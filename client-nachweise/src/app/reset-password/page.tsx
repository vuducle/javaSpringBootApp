import ResetPassword from '@/features/auth/ResetPassword';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Passwort zurücksetzen',
};

export default function ResetPasswordPage() {
  return <ResetPassword />;
}
