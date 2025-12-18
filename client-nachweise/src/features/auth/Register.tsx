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
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    email: '',
    ausbildungsjahr: '',
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { t } = useTranslation();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e?: FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form data
      if (
        !formData.username ||
        !formData.name ||
        !formData.password ||
        !formData.email ||
        !formData.ausbildungsjahr
      ) {
        const msg = t('register.error.fillAllFields');
        setError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }

      const response = await api.post('/api/auth/register', {
        username: formData.username,
        name: formData.name,
        password: formData.password.trim(),
        email: formData.email,
        ausbildungsjahr: parseInt(formData.ausbildungsjahr),
      });

      toast.success(t('register.success'));
      router.push('/login');
    } catch (err) {
      let errorMsg = t('register.error.unexpected');
      if (axios.isAxiosError(err) && err.response) {
        errorMsg =
          err.response.data?.message || t('register.error.failed');
      }
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
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
      <div className="max-w-2xl w-full">
        <div className="flex flex-col justify-center items-center mb-8 md:mb-12">
          <Image
            src="/logo.png"
            alt="NachweisWelt Logo"
            width={200}
            height={50}
          />
          <h1 className="text-3xl md:text-4xl font-bold mt-4 text-foreground text-center">
            {t('register.title')}
          </h1>
          <p className="text-lg mt-2 text-muted-foreground text-center">
            {t('register.description')}
          </p>
        </div>
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-2xl border border-border bg-card/20 backdrop-blur-md shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-primary text-center">
                {t('register.heading')}
              </CardTitle>
              <CardDescription className="text-center">
                {t('register.subheading')}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister} className="w-full">
              <CardContent className="grid gap-4">
                {/* Username */}
                <div className="grid gap-2">
                  <Label htmlFor="username">
                    {t('register.usernameLabel')}
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder={t('register.usernamePlaceholder')}
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Full Name */}
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    {t('register.nameLabel')}
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder={t('register.namePlaceholder')}
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="email">
                    {t('register.emailLabel')}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t('register.emailPlaceholder')}
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Password */}
                <div className="grid gap-2">
                  <Label htmlFor="password">
                    {t('register.passwordLabel')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('register.passwordPlaceholder')}
                      value={formData.password}
                      onChange={handleChange}
                      required
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

                {/* Ausbildungsjahr */}
                <div className="grid gap-2 mb-4">
                  <Label htmlFor="ausbildungsjahr">
                    {t('register.ausbildungsjahr')}
                  </Label>
                  <Input
                    id="ausbildungsjahr"
                    name="ausbildungsjahr"
                    type="number"
                    placeholder={t(
                      'register.ausbildungsjahrPlaceholder'
                    )}
                    min="1"
                    max="4"
                    value={formData.ausbildungsjahr}
                    onChange={handleChange}
                    required
                  />
                </div>

                {error && (
                  <p className="text-destructive text-sm bg-destructive/10 p-3 rounded">
                    {error}
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button
                  className="w-full"
                  type="submit"
                  disabled={loading}
                >
                  <UserPlus />
                  {loading
                    ? t('register.loading')
                    : t('register.submitButton')}
                </Button>
                <div className="text-sm text-center">
                  {t('register.haveAccount')}{' '}
                  <Link
                    href="/login"
                    className="font-medium text-primary hover:underline"
                    passHref
                  >
                    {t('register.loginLinkText')}
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
