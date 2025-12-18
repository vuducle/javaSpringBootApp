'use client';

import React, { useState, useEffect } from 'react';
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
import { Pen } from 'lucide-react';
import useTrainers from '@/hooks/useTrainers';
// StatusPlaceholder not needed here because we don't fetch profile from the server

interface Benutzer {
  id: string;
  username: string;
  name: string;
  email: string;
  profileImageUrl?: string | null;
  ausbildungsjahr?: number;
  telefonnummer?: string;
  team?: string;
  roles?: string[];
}

export default function EditUserModal({
  user,
  onUpdated,
}: {
  user: Benutzer;
  onUpdated?: () => void;
}) {
  const { t } = useTranslation();
  function extractErrorMessage(err: unknown): string | undefined {
    if (typeof err === 'string') return err;
    if (err && typeof err === 'object') {
      const e = err as Record<string, unknown>;
      if (
        'response' in e &&
        e.response &&
        typeof e.response === 'object'
      ) {
        const resp = e.response as Record<string, unknown>;
        if ('data' in resp) {
          const d = resp.data;
          if (typeof d === 'string') return d;
          if (
            d &&
            typeof d === 'object' &&
            'message' in (d as Record<string, unknown>)
          ) {
            const m = (d as Record<string, unknown>).message;
            if (typeof m === 'string') return m;
          }
        }
      }
      if ('message' in e && typeof e.message === 'string')
        return e.message;
    }
    return undefined;
  }
  const { showToast } = useToast();
  const { mutate } = useSWRConfig();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [showRevokeResult, setShowRevokeResult] = useState(false);
  const [revokeResult, setRevokeResult] = useState<{
    message?: string;
    affectedTraineesCount?: number;
    affectedTraineeUsernames?: string[];
  } | null>(null);
  const [form, setForm] = useState({
    name: user.name ?? '',
    email: user.email ?? '',
    ausbildungsjahr: user.ausbildungsjahr ?? 1,
    telefonnummer: user.telefonnummer ?? '',
    trainerId: user.trainer?.id ?? '',
    role: (user.roles && user.roles[0]) ?? 'ROLE_USER',
  });
  // update form when user prop changes (or when opening a different user)
  useEffect(() => {
    setForm({
      name: user.name ?? '',
      email: user.email ?? '',
      ausbildungsjahr: user.ausbildungsjahr ?? 1,
      telefonnummer: user.telefonnummer ?? '',
      trainerId: user.trainer?.id ?? '',
      role: (user.roles && user.roles[0]) ?? 'ROLE_USER',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user.username, user.roles]);

  const [initialRole, setInitialRole] = useState<string>(
    (user.roles && user.roles[0]) ?? 'ROLE_USER'
  );
  useEffect(() => {
    setInitialRole((user.roles && user.roles[0]) ?? 'ROLE_USER');
  }, [user.username, user.roles]);

  const {
    trainers,
    isLoading: trainersLoading,
    error: trainersError,
  } = useTrainers();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!form.name || !form.email) {
      setFormError(
        t('userPage.editErrorMissing') ||
          'Please fill required fields.'
      );
      return;
    }
    const emailRegex = new RegExp('\\S+@\\S+\\.\\S+');
    if (!emailRegex.test(form.email)) {
      setFormError(t('userPage.createErrorEmail') || 'Invalid email');
      return;
    }

    // Check if we're about to revoke admin — show confirmation first
    if (form.role !== 'ROLE_ADMIN' && initialRole === 'ROLE_ADMIN') {
      setShowRevokeConfirm(true);
      return;
    }

    // Otherwise proceed normally
    await saveProfile();
  }

  async function saveProfile() {
    setSaving(true);
    try {
      await api.put(
        `/api/user/users/${encodeURIComponent(
          user.username
        )}/profile`,
        form
      );
      // handle role changes: grant admin if needed
      if (
        form.role === 'ROLE_ADMIN' &&
        initialRole !== 'ROLE_ADMIN'
      ) {
        try {
          await api.put(
            `/api/user/${encodeURIComponent(
              user.username
            )}/grant-admin`
          );
          showToast(
            t('userPage.grantAdminSuccess') || 'Admin role granted',
            'success'
          );
        } catch {
          showToast(
            t('userPage.grantAdminFailed') ||
              'Failed to assign admin role',
            'warning'
          );
        }
      }
      showToast(
        t('userPage.editSuccess') || 'Profile updated',
        'success'
      );
      setOpen(false);
      try {
        // revalidate user list and trainers in case team changed
        mutate('/api/user/users');
        mutate('/api/user/trainers');
      } catch {}
      onUpdated?.();
    } catch (err) {
      const msg =
        extractErrorMessage(err) ||
        t('userPage.editError') ||
        'Failed to update';
      setFormError(
        typeof msg === 'string' ? msg : JSON.stringify(msg)
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRevokeConfirmed() {
    setShowRevokeConfirm(false);
    setSaving(true);
    try {
      // First save profile
      await api.put(
        `/api/user/users/${encodeURIComponent(
          user.username
        )}/profile`,
        form
      );

      // Then revoke admin
      const revokeResponse = await api.delete(
        `/api/user/${encodeURIComponent(user.username)}/revoke-admin`
      );

      // Show success with info about affected trainees
      const data = revokeResponse.data as {
        message?: string;
        affectedTraineesCount?: number;
        affectedTraineeUsernames?: string[];
      };

      const message =
        data.message ||
        t('userPage.revokeAdminSuccess') ||
        'Admin role revoked';
      showToast(message, 'success');

      // Close edit dialog and show a result dialog with details
      setOpen(false);
      setRevokeResult(data);
      setShowRevokeResult(true);
      try {
        mutate('/api/user/users');
        mutate('/api/user/trainers');
      } catch {}
      onUpdated?.();
    } catch (err) {
      const msg =
        extractErrorMessage(err) ||
        t('userPage.revokeAdminFailed') ||
        'Failed to revoke admin role';
      showToast(
        typeof msg === 'string' ? msg : JSON.stringify(msg),
        'error'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-chart-4 hover:bg-chart-4/80 dark:bg-chart-4 dark:hover:bg-chart-4/80 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          <Pen />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('userPage.editTitle') ?? 'Edit User'}
          </DialogTitle>
          <DialogDescription>
            {t('userPage.editDescription') ?? 'Edit user profile'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-3 mt-2"
        >
          <label className="text-sm">
            {t('userPage.nameLabel') ?? 'Name'}
          </label>
          <Input
            value={form.name}
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
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: (e.target as HTMLInputElement).value,
              })
            }
          />

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
                  value={tr.id ?? tr.username ?? ''}
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
            <Button type="submit" disabled={saving}>
              {saving
                ? t('common.loading')
                : t('userPage.saveButton') ?? 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Revoke Admin Confirmation Dialog */}
      <Dialog
        open={showRevokeConfirm}
        onOpenChange={setShowRevokeConfirm}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('userPage.revokeConfirmTitle') ??
                '⚠️ Admin-Rolle entziehen?'}
            </DialogTitle>
            <DialogDescription>
              {t('userPage.revokeConfirmDescription') ??
                'Diesem Benutzer wird die Admin-Rolle entzogen. Alle zugewiesenen Azubis werden automatisch entfernt (Team auf leer gesetzt).'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="ghost"
                onClick={() => setShowRevokeConfirm(false)}
              >
                {t('common.cancel') ?? 'Abbrechen'}
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleRevokeConfirmed}
              disabled={saving}
            >
              {saving
                ? t('common.loading')
                : t('userPage.revokeConfirmButton') ??
                  'Admin entziehen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Result Dialog: shows list/count of affected trainees */}
      <Dialog
        open={showRevokeResult}
        onOpenChange={setShowRevokeResult}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {revokeResult?.message ??
                (t('userPage.revokeResultTitle') || 'Revoke result')}
            </DialogTitle>
            <DialogDescription>
              {revokeResult &&
              revokeResult.affectedTraineesCount !== undefined ? (
                <>
                  {t('userPage.revokeResultDescription') ||
                    'Affected trainees:'}
                  <div className="mt-2">
                    <strong>
                      {revokeResult.affectedTraineesCount}
                    </strong>{' '}
                    {t('userPage.affectedTraineesLabel') ||
                      'trainee(s) affected'}
                  </div>
                </>
              ) : (
                t('userPage.revokeNoAffected') ||
                'No affected trainees.'
              )}
            </DialogDescription>
          </DialogHeader>

          {revokeResult?.affectedTraineeUsernames &&
            revokeResult.affectedTraineeUsernames.length > 0 && (
              <div className="mt-4 max-h-60 overflow-auto">
                <ul className="list-disc list-inside">
                  {revokeResult.affectedTraineeUsernames.map((u) => (
                    <li key={u} className="text-sm">
                      {u}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          <DialogFooter>
            <Button onClick={() => setShowRevokeResult(false)}>
              {t('common.ok') ?? 'OK'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
