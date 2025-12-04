'use client';

import { useTranslation } from '@/context/LanguageContext';
import { useEffect, useState } from 'react';
import  api  from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusPlaceholder from "@/components/ui/StatusPlaceholder";

interface AuditItem {
  id: string;
  nachweisId: string;
  aktion: string;
  aktionsZeit: string;
  benutzerName: string;
}

export default function AuditTrail() {
  const { t } = useTranslation();
  const [auditTrail, setAuditTrail] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuditTrail = async () => {
      try {
        const response = await api.get('/api/admin/nachweis-audit/');
        const sortedItems = response.data.items.sort(
          (a: AuditItem, b: AuditItem) =>
            new Date(b.aktionsZeit).getTime() - new Date(a.aktionsZeit).getTime()
        );
        setAuditTrail(sortedItems.slice(0, 3));
      } catch (error) {
        console.error('Error fetching audit trail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditTrail();
  }, []);

    if (loading) {
        return (
            <StatusPlaceholder
                loading
                loadingText={t('common.loading') ?? 'Lädt...'}
            />
        );
    }

  return (
    <Card className="bg-white dark:bg-zinc-800 shadow-lg rounded-lg mt-4">
      <CardHeader>
        <CardTitle>{t('auditTrail.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {auditTrail.map((item) => (
            <li key={item.id} className="border-b pb-2">
              <p>
                <strong>{t('auditTrail.user')}:</strong> {item.benutzerName}
              </p>
              <p>
                <strong>{t('auditTrail.action')}:</strong> {item.aktion}
              </p>
              <p>
                <strong>{t('auditTrail.time')}:</strong> {new Date(item.aktionsZeit).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
