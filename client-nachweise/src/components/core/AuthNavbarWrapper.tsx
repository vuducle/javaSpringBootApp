'use client';

import { useAppSelector } from '@/store';
import { Navbar } from './Navbar';

export function AuthNavbarWrapper() {
  const user = useAppSelector((state) => state.user);

  if (!user.istEingeloggt) {
    return null;
  }

  return <Navbar user={user} />;
}
