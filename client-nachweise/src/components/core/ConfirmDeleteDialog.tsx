'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/LanguageContext';
import { useToast } from '@/hooks/useToast';

export default function ConfirmDeleteDialog(props: {
  children: React.ReactNode;
  onConfirm: () => Promise<void> | void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const {
    children,
    onConfirm,
    title,
    description,
    confirmLabel,
    cancelLabel,
  } = props;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setError(null);
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      showToast(
        t('nachweis.deleteError') || t('nachweis.errorMessage'),
        'error'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {title ?? t('nachweis.deleteConfirmTitle')}
          </DialogTitle>
          <DialogDescription>
            {description ?? t('nachweis.deleteConfirmDescription')}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="text-sm text-destructive mb-2">{error}</div>
        )}
        <DialogFooter>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              {cancelLabel ?? t('nachweis.deleteCancel')}
            </Button>
            <Button
              className="bg-destructive"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading
                ? t('common.loading')
                : confirmLabel ?? t('nachweis.deleteConfirmButton')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
