'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { useToast } from '@/hooks/useToast';
import api from '@/lib/api';
import { useSWRConfig } from 'swr';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Plus } from 'lucide-react';
import useTrainers from '@/hooks/useTrainers';

function validatePassword(
  pw: string,
  t: (key: string) => string | undefined
): string | undefined {
  if (!pw || pw.length < 8)
    return (
      t('userPage.passwordTooShort') ||
      'Password must be at least 8 characters.'
    );
  if (!/[A-Z]/.test(pw))
    return (
      t('userPage.passwordRequiresUpper') ||
      'Password must include an uppercase letter.'
    );
  if (!/[0-9]/.test(pw))
    return (
      t('userPage.passwordRequiresNumber') ||
      'Password must include a number.'
    );
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(pw))
    return (
      t('userPage.passwordRequiresSymbol') ||
      'Password must include a symbol.'
    );
  return undefined;
}

export default function CreateUserModal({
  onCreated,
}: {
  onCreated?: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { mutate } = useSWRConfig();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    username: '',
    name: '',
    password: '',
    email: '',
    ausbildungsjahr: 1,
    telefonnummer: '',
    trainerId: '',
    role: 'ROLE_USER',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const {
    trainers,
    isLoading: trainersLoading,
    error: trainersError,
  } = useTrainers();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    // client-side password strength validation
    const pwError = validatePassword(form.password, t);
    if (pwError) {
      setFormError(pwError);
      return;
    }
    if (!form.username || !form.password || !form.email) {
      setFormError(
        t('userPage.createErrorMissing') ||
          'Please fill required fields.'
      );
      return;
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(form.email)) {
      setFormError(t('userPage.createErrorEmail') || 'Invalid email');
      return;
    }
    setCreating(true);
    try {
      await api.post('/api/auth/register', form);
      // if admin role selected, call grant-admin endpoint for this username
      if (form.role === 'ROLE_ADMIN') {
        try {
          await api.put(
            `/api/user/${encodeURIComponent(
              form.username
            )}/grant-admin`
          );
        } catch {
          // non-fatal: show toast but continue
          showToast(
            t('userPage.grantAdminFailed') ||
              'Failed to assign admin role',
            'warning'
          );
        }
      }
      showToast(
        t('userPage.createSuccess') || 'User created',
        'success'
      );
      setOpen(false);
      setForm({
        username: '',
        name: '',
        password: '',
        email: '',
        ausbildungsjahr: 1,
        telefonnummer: '',
        trainerId: '',
        role: 'USER',
      });
      // revalidate trainers list so newly-created admins show up
      try {
        mutate('/api/user/trainers');
      } catch {}
      onCreated?.();
    } catch (err) {
      const asErr = err as
        | { response?: { data?: string } }
        | undefined;
      setFormError(
        (asErr && asErr.response && asErr.response.data) ||
          t('userPage.createError') ||
          'Failed to create user'
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          aria-label={t('userPage.title') ?? 'Create user'}
        >
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('userPage.title') ?? 'Create User'}
          </DialogTitle>
          <DialogDescription>
            {t('userPage.createDescription') ??
              'Create a new user account.'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-3 mt-2"
        >
          <label className="text-sm">
            {t('userPage.usernameLabel') ?? 'Username'}
          </label>
          <Input
            value={form.username}
            placeholder="limingle"
            onChange={(e) =>
              setForm({
                ...form,
                username: (e.target as HTMLInputElement).value,
              })
            }
          />

          <label className="text-sm">
            {t('userPage.nameLabel') ?? 'Name'}
          </label>
          <Input
            value={form.name}
            placeholder="Li Ming Lê"
            onChange={(e) =>
              setForm({
                ...form,
                name: (e.target as HTMLInputElement).value,
              })
            }
          />

          <label className="text-sm">
            {t('userPage.emailLabel') ?? 'Email'}
          </label>
          <Input
            type="email"
            placeholder="limingle@example.com"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: (e.target as HTMLInputElement).value,
              })
            }
          />

          <label className="text-sm">
            {t('userPage.passwordLabel') ?? 'Password'}
          </label>
          <Input
            type="password"
            placeholder="DeinPasswort420!@"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: (e.target as HTMLInputElement).value,
              })
            }
          />
          <div className="text-xs text-muted-foreground">
            {t('userPage.passwordRequirements') ??
              'Password must be ≥8 chars, include an uppercase letter, a number and a symbol.'}
          </div>

          <label className="text-sm">
            {t('userPage.yearLabel') ?? 'Ausbildungsjahr'}
          </label>
          <Input
            type="number"
            value={String(form.ausbildungsjahr)}
            onChange={(e) =>
              setForm({
                ...form,
                ausbildungsjahr: Number(
                  (e.target as HTMLInputElement).value
                ),
              })
            }
          />

          <label className="text-sm">
            {t('userPage.phoneLabel') ?? 'Telefonnummer'}
          </label>
          <Input
            value={form.telefonnummer}
            placeholder="+84 (366) 123-4567"
            onChange={(e) =>
              setForm({
                ...form,
                telefonnummer: (e.target as HTMLInputElement).value,
              })
            }
          />

          <label className="text-sm">
            {t('userPage.teamLabel') ?? 'Team'}
          </label>
          <Select
            value={form.trainerId}
            onValueChange={(val: string) =>
              setForm({ ...form, trainerId: val })
            }
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  t('userPage.teamSelectPlaceholder') ??
                  'Select trainer'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {trainersLoading && (
                <SelectItem value="">
                  {t('common.loading') ?? 'Loading...'}
                </SelectItem>
              )}
              {trainersError && (
                <SelectItem value="">
                  {t('userPage.loadTrainersError') ??
                    'Failed to load trainers'}
                </SelectItem>
              )}
              {trainers.map((tr) => (
                <SelectItem
                  key={tr.id ?? tr.username}
                  value={tr.name ?? ''}
                >
                  <div className="flex items-center space-x-2">
                    {tr.profileImageUrl ? (
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={`${
                            process.env.NEXT_PUBLIC_API_URL ||
                            'http://localhost:8088'
                          }${tr.profileImageUrl}`}
                          alt={tr.name}
                        />
                      </Avatar>
                    ) : (
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {(tr.name || '')
                            .split(' ')
                            .map((n: string) => n.charAt(0))
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span className="text-sm">{tr.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className="text-sm">
            {t('userPage.roleLabel') ?? 'Role'}
          </label>
          <Select
            value={form.role}
            onValueChange={(val: string) =>
              setForm({ ...form, role: val })
            }
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  t('userPage.rolePlaceholder') ?? 'Select role'
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ROLE_USER">
                {t('roles.user') ?? 'User'}
              </SelectItem>
              <SelectItem value="ROLE_ADMIN">
                {t('roles.admin') ?? 'Admin'}
              </SelectItem>
            </SelectContent>
          </Select>

          {formError && (
            <div className="text-sm text-destructive">
              {formError}
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">
                {t('common.cancel') ?? 'Cancel'}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={creating}>
              {creating
                ? t('common.loading')
                : t('userPage.createButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
