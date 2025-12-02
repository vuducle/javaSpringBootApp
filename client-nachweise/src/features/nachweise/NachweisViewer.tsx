'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import api from '@/lib/api';

interface Props {
  id: string;
}

export default function NachweisViewer({ id }: Props) {
  const { t } = useTranslation();
  const [userId, setUserId] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNachweis = async () => {
      try {
        const res = await api.get(`/api/nachweise/${id}`);
        setUserId(res.data.azubi.id);
        setUsername(res.data.azubi.name);
      } catch (error) {
        console.error('Failed to fetch nachweis:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNachweis();
  }, [id]);

  const pdfUrl = useMemo(() => {
    if (!id) return '';

    // TEMP: Hardcode for testing - replace with API call later
    // Format: /generated_pdfs/{username}_{userId}/{nachweisId}.pdf
    const tempUserId = '309a03f1-2711-4515-a557-9a429816583f';
    const tempUsername = 'vu_duc_le';

    if (!userId || !username) {
      // Fallback to temp values while loading
      return `${process.env.NEXT_PUBLIC_API_URL}/generated_pdfs/${tempUsername}_${tempUserId}/${id}.pdf`;
    }

    const userFolder = `${username
      .toLowerCase()
      .replace(/ /g, '_')}_${userId}`;
    return `${process.env.NEXT_PUBLIC_API_URL}/generated_pdfs/${userFolder}/${id}.pdf`;
  }, [id, userId, username]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `nachweis-${id}.pdf`;
    link.click();
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        {t('nachweis.viewer.loading')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">
          {t('nachweis.viewer.title')}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleDownload} disabled={!pdfUrl}>
            <Download className="mr-2 h-4 w-4" />
            {t('nachweis.viewer.download')}
          </Button>
          <Button
            onClick={() => window.open(pdfUrl, '_blank')}
            disabled={!pdfUrl}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {t('nachweis.viewer.openInNewTab')}
          </Button>
        </div>
      </div>

      {pdfUrl ? (
        <iframe
          src={pdfUrl}
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
