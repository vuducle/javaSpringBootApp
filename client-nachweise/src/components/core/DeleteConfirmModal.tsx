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
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/context/LanguageContext';

export default function DeleteConfirmModal<
  T extends { username?: string }
>(props: {
  children: React.ReactNode;
  requiredConfirmation: string; // exact string user must type
  onConfirm: () => Promise<void> | void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}) {
  const { t } = useTranslation();
  const {
    children,
    requiredConfirmation,
    onConfirm,
    title,
    description,
    confirmLabel,
    cancelLabel,
  } = props;

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMatch = input.trim() === requiredConfirmation.trim();

  async function handleConfirm() {
    setError(null);
    if (!isMatch) {
      setError(
        t('deleteModal.inputMismatch') ||
          'Confirmation does not match'
      );
      return;
    }
    setSaving(true);
    try {
      await onConfirm();
      setOpen(false);
      setInput('');
    } catch (e: any) {
      setError((e && e.message) || String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {title ??
              t('deleteModal.title') ??
              'Delete — Are you sure?'}
          </DialogTitle>
          <DialogDescription>
            {description ??
              t('deleteModal.description') ??
              'This will permanently delete all associated data.'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <p className="text-sm mb-2">
            {t('deleteModal.instruction') ??
              'To confirm, type the command exactly:'}
          </p>
          <div className="bg-muted p-3 rounded mb-3 text-xs font-mono wrap-break-word">
            {requiredConfirmation}
          </div>
          <Input
            placeholder={
              t('deleteModal.placeholder') ?? 'Type confirmation here'
            }
            value={input}
            onChange={(e) =>
              setInput((e.target as HTMLInputElement).value)
            }
          />
          {error && (
            <div className="text-sm text-destructive mt-2">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={saving}
          >
            {cancelLabel ?? t('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isMatch || saving}
          >
            {saving
              ? t('common.loading')
              : confirmLabel ?? t('deleteModal.confirmButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
