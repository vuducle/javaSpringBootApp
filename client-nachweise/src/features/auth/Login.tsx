'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageSwitcher } from '@/components/core/LanguageSwitcher';
import { useTranslation } from '@/context/LanguageContext';
import { useAppDispatch } from '@/store';
import { setUser } from '@/store/slices/userSlice';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { Key, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function LoginForm() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation();

  const handleResendVerification = async () => {
    try {
      await api.post('/api/auth/resend-verification', { email });
      toast.success(t('verification.successVerificationEmailSent'));
    } catch (err) {
      toast.error(t('verification.error.unexpected'));
    }
  };

  const handleLogin = async (e?: FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    setError('');
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password: password.trim(), // Trim whitespace
      });
      const { accessToken, refreshToken, id, name, roles } =
        response.data;
      dispatch(
        setUser({
          token: accessToken,
          refreshToken,
          id,
          email,
          name,
          istEingeloggt: true,
          roles,
        })
      );
      toast.success('Erfolgreich angemeldet!');
      router.push('/');
    } catch (err) {
      let errorMessage = t('login.error.unexpected');
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 403) {
          errorMessage = t('login.error.unverified');
          // Show a resend verification button
          toast.error(
            <div>
              <p>{errorMessage}</p>
              <button
                onClick={handleResendVerification}
                className="mt-2 underline text-sm"
              >
                {t('login.resendVerification')}
              </button>
            </div>,
            { autoClose: false }
          );
          setError(errorMessage);
          return;
        } else if (err.response.status === 423) {
          errorMessage = t('login.error.locked');
        } else if (err.response.status === 404) {
          errorMessage = t('login.error.userNotFound');
        } else {
          errorMessage = t('login.error.invalid');
        }
      }
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-background dark:bg-background"
      style={{ backgroundImage: 'url(/background-pattern.svg)' }}
    >
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <div className="flex flex-col justify-center items-center md:items-start p-8">
          <Image
            src="/logo.png"
            alt="NachweisWelt Logo"
            width={200}
            height={50}
          />
          <h1 className="text-3xl md:text-4xl font-bold mt-4 text-foreground text-center md:text-left">
            {t('loginPage.mainTitle')}
          </h1>
          <p className="text-lg mt-2 text-muted-foreground text-center md:text-left">
            {t('loginPage.subtitle')}
          </p>
        </div>
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-sm border border-border bg-card/20 backdrop-blur-md shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-primary text-center md:text-left">
                {t('login.title')}
              </CardTitle>
              <CardDescription className="text-center md:text-left">
                {t('login.description')}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin} className="w-full">
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">
                    <Mail />
                    {t('login.emailLabel')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('login.emailPlaceholder')}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">
                    <Lock />
                    {t('login.passwordLabel')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="text-sm mb-4">
                  <Link
                    href="/forgot-password"
                    className="font-medium mb-4 text-primary hover:underline"
                    passHref
                  >
                    {t('login.forgotPassword')}
                  </Link>
                </div>
                {error && (
                  <p className="text-destructive text-sm">{error}</p>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" type="submit">
                  <Key />
                  {t('login.submitButton')}
                </Button>
                <div className="text-sm text-center">
                  {t('login.noAccount')}{' '}
                  <Link
                    href="/register"
                    className="font-medium text-primary hover:underline"
                    passHref
                  >
                    {t('login.registerLinkText')}
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
