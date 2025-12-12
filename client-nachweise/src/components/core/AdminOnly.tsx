'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';

interface AdminOnlyProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function AdminOnly({
  children,
  redirectTo = '/',
}: AdminOnlyProps) {
  const user = useAppSelector((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!user.istEingeloggt) {
      // if not logged in, redirect to login
      router.replace('/login');
      return;
    }

    const isAdmin =
      Array.isArray(user.roles) && user.roles.includes('ROLE_ADMIN');
    if (!isAdmin) {
      // not allowed
      router.replace(redirectTo);
    }
  }, [user, router, redirectTo]);

  // while client-side checks run, we can avoid rendering children to prevent flicker
  if (!user.istEingeloggt) return null;
  if (
    !Array.isArray(user.roles) ||
    !user.roles.includes('ROLE_ADMIN')
  )
    return null;

  return <>{children}</>;
}
