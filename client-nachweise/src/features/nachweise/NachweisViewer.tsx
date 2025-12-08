'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/context/LanguageContext';
import { useAppSelector } from '@/store';
import { selectUser } from '@/store/slices/userSlice';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { Save } from 'lucide-react';

interface Props {
  id: string;
}

export default function NachweisViewer({ id }: Props) {
  const { showToast } = useToast();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nachweisStatus, setNachweisStatus] = useState<string | null>(
    null
  );
  const [nachweisComment, setNachweisComment] = useState<string>('');
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);
  const isAusbilder =
    Array.isArray(user.roles) && user.roles.includes('ROLE_ADMIN');

  useEffect(() => {
    if (!id) return;
    let url: string | null = null;
    const fetchPdf = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/nachweise/${id}/pdf`, {
          responseType: 'blob',
        });

        const blob = new Blob([res.data], {
          type: 'application/pdf',
        });

        // Validate content-type and blob size
        const contentType =
          res.headers?.['content-type'] ||
          res.headers?.['Content-Type'];
        if (
          contentType &&
          !contentType.toLowerCase().includes('pdf')
        ) {
          // response isn't a PDF (could be HTML login page), show error
          const text = await blob.text();
          console.error(
            'Expected PDF but got:',
            contentType,
            text.substring(0, 300)
          );
          setError('Server hat kein PDF zurückgegeben.');
          showToast('Server hat kein PDF zurückgegeben.', 'error');
          return;
        }

        if ((blob as any).size === 0) {
          setError('PDF ist leer.');
          showToast('PDF ist leer.', 'error');
          return;
        }

        url = URL.createObjectURL(blob);
        setBlobUrl(url);

        // Try to extract filename from Content-Disposition header
        const contentDisposition =
          res.headers?.['content-disposition'] ||
          res.headers?.['Content-Disposition'];
        if (contentDisposition) {
          const fileNameMatch =
            /filename\*?=(?:UTF-8''")?([^;\n\r"]+)/i.exec(
              contentDisposition
            );
          if (fileNameMatch && fileNameMatch[1]) {
            // decode RFC5987 encoding if present
            try {
              const decoded = decodeURIComponent(fileNameMatch[1]);
              setFileName(decoded.replace(/"/g, ''));
            } catch {
              setFileName(fileNameMatch[1].replace(/"/g, ''));
            }
          }
        }
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 403) {
          setError(
            'Zugriff verweigert. Du bist nicht berechtigt, dieses PDF anzusehen.'
          );
          showToast('Zugriff verweigert', 'error');
        } else if (status === 404) {
          setError('PDF nicht gefunden.');
          showToast('PDF nicht gefunden', 'error');
        } else {
          setError(err?.message || 'Fehler beim Laden des PDFs');
          showToast(
            err?.message || 'Fehler beim Laden des PDFs',
            'error'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPdf();

    // fetch nachweis details (status/comment)
    const fetchDetails = async () => {
      setDetailsLoading(true);
      try {
        const res = await api.get(`/api/nachweise/${id}`);
        const data = res.data;
        setNachweisStatus(data.status ?? null);
        setNachweisComment(data.comment ?? data.remark ?? '');
      } catch (err: any) {
        // ignore details errors silently, but log
        console.error(
          'Could not fetch nachweis details',
          err?.response || err
        );
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchDetails();
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [id]);

  if (loading) return <div>{t('nachweis.viewer.loading')}</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">
          {t('nachweis.viewer.title')}
        </div>
        <div className="flex items-center gap-2">
          {blobUrl && (
            <a
              href={blobUrl}
              download={fileName ?? `nachweis-${id}.pdf`}
            >
              <Button>
                <Download className="mr-2 h-4 w-4" />
                {t('nachweis.viewer.download')}
              </Button>
            </a>
          )}
          {blobUrl && (
            <Button
              onClick={() => {
                window.open(blobUrl, '_blank');
              }}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {t('nachweis.viewer.openInNewTab')}
            </Button>
          )}
        </div>
      </div>

      {/* Status / Kommentar Bereich */}
      <div className="space-y-2">
        {detailsLoading ? (
          <div>{t('nachweis.viewer.loading')}</div>
        ) : (
          <div className="p-4 border rounded">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2"
                  data-testid="nachweis-status-badge"
                >
                  <span className="text-lg">
                    {nachweisStatus === 'ANGENOMMEN'
                      ? '💚'
                      : nachweisStatus === 'ABGELEHNT'
                      ? '❌'
                      : nachweisStatus === 'IN_BEARBEITUNG'
                      ? '⏳'
                      : '❔'}
                  </span>
                  <span className="uppercase tracking-wide text-xs">
                    {nachweisStatus
                      ? t(`nachweis.status${nachweisStatus}`)
                      : t('nachweis.viewer.unknown')}
                  </span>
                </div>

                <div className="text-sm text-muted-foreground">
                  {t('nachweis.viewer.title')}
                </div>
              </div>

              {isAusbilder && (
                <div className="text-sm text-muted-foreground">
                  {t('nachweis.viewer.youAreTrainer')}
                </div>
              )}
            </div>

            {isAusbilder ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!id) return;
                  setSaving(true);
                  try {
                    await api.put(`/api/nachweise/${id}/status`, {
                      nachweisId: id,
                      status: nachweisStatus,
                      comment: nachweisComment || undefined,
                    });
                    showToast(
                      t('nachweis.viewer.statusSaved'),
                      'success'
                    );
                  } catch (err: any) {
                    console.error(err);
                    showToast(
                      err?.response?.data?.message ||
                        t('nachweis.viewer.statusSaveError'),
                      'error'
                    );
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                  <div>
                    <Select
                      defaultValue={nachweisStatus ?? ''}
                      onValueChange={(v) => setNachweisStatus(v)}
                    >
                      <SelectTrigger
                        aria-label="status"
                        className="w-48"
                      >
                        <SelectValue
                          placeholder={
                            t('nachweis.viewer.status') as string
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>
                            {t('nachweis.viewer.status')}
                          </SelectLabel>
                          <SelectItem value="ANGENOMMEN">
                            💚 {t('nachweis.viewer.accepted')}
                          </SelectItem>
                          <SelectItem value="ABGELEHNT">
                            ❌ {t('nachweis.viewer.rejected')}
                          </SelectItem>
                          <SelectItem value="IN_BEARBEITUNG">
                            ⏳ {t('nachweis.statusIN_BEARBEITUNG')}
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="comment">
                      {t('nachweis.viewer.comment')}
                    </Label>
                    <textarea
                      id="comment"
                      className="w-full rounded-xl p-3 bg-linear-to-r from-white to-slate-50 border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:italic placeholder:text-slate-400"
                      rows={4}
                      value={nachweisComment}
                      onChange={(e) =>
                        setNachweisComment(e.target.value)
                      }
                      placeholder={
                        t(
                          'nachweis.viewer.commentPlaceholder'
                        ) as string
                      }
                    />
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-linear-to-r from-pink-500 to-violet-500 text-white"
                  >
                    <Save className="size-4" />
                    {saving
                      ? t('nachweis.viewer.saving')
                      : t('nachweis.viewer.save')}
                  </Button>
                </div>
              </form>
            ) : (
              // for apprentices / other users, show read-only comment if present
              <div>
                <Label>{t('nachweis.viewer.trainerComment')}</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded">
                  {nachweisComment || t('nachweis.viewer.noComment')}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {blobUrl ? (
        <iframe
          src={blobUrl}
          title="Nachweis PDF"
          className="w-full h-[80vh] border"
        />
      ) : (
        <div className="text-muted-foreground">
          {t('nachweis.viewer.noPdfAvailable')}
        </div>
      )}
    </div>
  );
}
