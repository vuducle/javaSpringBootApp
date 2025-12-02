'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/context/LanguageContext';

interface Props {
  id: string;
}

export default function NachweisViewer({ id }: Props) {
  const { showToast } = useToast();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

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
