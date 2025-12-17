'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export default function FeaturesModal() {
  const { t } = useTranslation();

  const features = [
    {
      key: 'auth',
      title: t('features.auth.title') ?? 'Authentication',
      desc:
        t('features.auth.desc') ??
        'Login / Register with JWT tokens (access + refresh).',
    },
    {
      key: 'profile',
      title: t('features.profile.title') ?? 'User Profile',
      desc:
        t('features.profile.desc') ??
        'Change password, upload/delete profile image, view profile.',
    },
    {
      key: 'nachweise',
      title:
        t('features.nachweis.title') ??
        'Training Records (Nachweise)',
      desc:
        t('features.nachweis.desc') ??
        'Create, edit, download PDF, admins can approve/reject and manage all records.',
    },
    {
      key: 'audit',
      title: t('features.audit.title') ?? 'Audit Logs',
      desc:
        t('features.audit.desc') ??
        'View Nachweis and Role audit trails (admin / trainer only).',
    },
    {
      key: 'admin',
      title: t('features.admin.title') ?? 'Admin Tools',
      desc:
        t('features.admin.desc') ??
        'Administrative endpoints: list all records, delete all, manage users.',
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="ml-2">
          <Info className="mr-2" />
          {t('features.button') ?? 'What this app can do'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('features.title') ?? 'App features'}
          </DialogTitle>
          <DialogDescription>
            {t('features.description') ??
              'Overview of available features and APIs.'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {features.map((f) => (
            <div key={f.key} className="p-3 border rounded-md">
              <div className="font-semibold">{f.title}</div>
              <div className="text-sm text-muted-foreground">
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
