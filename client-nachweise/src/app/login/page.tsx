import type { Metadata } from 'next';
import LoginForm from "@/features/auth/Login";

export const metadata: Metadata = {
  title: 'Login',
};

export default function LoginPage() {
  return <LoginForm />;
}