'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/LanguageContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const [verificationStatus, setVerificationStatus] = useState<
    'loading' | 'success' | 'error'
  >('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus('error');
        setErrorMessage(t('verification.error.noToken'));
        return;
      }

      try {
        await api.post(`/api/auth/verify-email?token=${token}`);
        setVerificationStatus('success');
        toast.success(t('verification.success'));

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (err: any) {
        setVerificationStatus('error');
        if (err.response?.status === 400) {
          setErrorMessage(t('verification.error.invalidToken'));
        } else {
          setErrorMessage(t('verification.error.unexpected'));
        }
        toast.error(
          errorMessage || t('verification.error.unexpected')
        );
      }
    };

    verifyEmail();
  }, [token, router, t, errorMessage]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {t('verification.title')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('verification.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {verificationStatus === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <p className="text-center text-muted-foreground">
                {t('verification.loading')}
              </p>
            </>
          )}

          {verificationStatus === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-center font-semibold text-green-600">
                {t('verification.success')}
              </p>
              <p className="text-center text-sm text-muted-foreground">
                {t('verification.redirecting')}
              </p>
            </>
          )}

          {verificationStatus === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-destructive" />
              <p className="text-center font-semibold text-destructive">
                {errorMessage}
              </p>
              <Button asChild className="mt-4">
                <Link href="/login">
                  {t('verification.backToLogin')}
                </Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
