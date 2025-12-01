'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { clearUser } from '@/store/slices/userSlice';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/LanguageContext';

export function SessionExpiredModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    // Listen for session expired events
    const handleSessionExpired = () => {
      setIsOpen(true);
      // Immediately clear Redux state when session expires
      dispatch(clearUser());
    };

    window.addEventListener('sessionExpired', handleSessionExpired);

    return () => {
      window.removeEventListener(
        'sessionExpired',
        handleSessionExpired
      );
    };
  }, [dispatch]);

  const handleLogin = () => {
    setIsOpen(false);
    // Clear any stored auth data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    sessionStorage.clear();
    router.push('/login');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <Card className="w-full max-w-md mx-4 shadow-2xl">
        <CardHeader>
          <CardTitle>{t('sessionExpired.title')}</CardTitle>
          <CardDescription>
            {t('sessionExpired.message')}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={handleLogin} className="w-full">
            {t('sessionExpired.loginButton')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
