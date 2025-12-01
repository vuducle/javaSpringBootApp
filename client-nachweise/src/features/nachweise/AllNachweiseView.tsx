'use client';

import { useState } from 'react';
import useSWR from 'swr';
import api from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Nachweis {
  id: string;
  name: string;
  datumStart: string;
  datumEnde: string;
  status: 'ANGENOMMEN' | 'ABGELEHNT' | 'IN_BEARBEITUNG';
}

interface NachweiseResponse {
  content: Nachweis[];
  totalPages: number;
}

// Fetcher function for SWR
const fetcher = async (
  url: string,
  params: Record<string, unknown>
) => {
  const response = await api.get<NachweiseResponse>(url, { params });
  return response.data;
};

export function AllNachweiseView() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [status, setStatus] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // SWR with dedupe, caching, and automatic revalidation
  const { data, error, isLoading } = useSWR(
    [
      '/api/nachweise/my-nachweise',
      {
        status: status === 'ALL' ? undefined : status,
        page,
        size,
      },
    ],
    ([url, params]) => fetcher(url, params),
    {
      // Dedupe requests within 2 seconds
      dedupingInterval: 2000,
      // Revalidate on focus (optional)
      revalidateOnFocus: false,
      // Don't retry on error by default
      shouldRetryOnError: false,
      // Keep previous data while loading new data
      keepPreviousData: true,
      onError: () => {
        showToast(t('nachweis.errorMessage'), 'error');
      },
    }
  );

  const getStatusVariant = (status: Nachweis['status']) => {
    switch (status) {
      case 'ANGENOMMEN':
        return 'success';
      case 'ABGELEHNT':
        return 'destructive';
      case 'IN_BEARBEITUNG':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        {t('nachweis.allNachweise')}
      </h1>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Select onValueChange={setStatus} value={status}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('nachweis.filterStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                {t('nachweis.statusAll')}
              </SelectItem>
              <SelectItem value="ANGENOMMEN">
                {t('nachweis.statusAngenommen')}
              </SelectItem>
              <SelectItem value="ABGELEHNT">
                {t('nachweis.statusAbgelehnt')}
              </SelectItem>
              <SelectItem value="IN_BEARBEITUNG">
                {t('nachweis.statusInBearbeitung')}
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <label className="text-sm">
              {t('nachweis.pageSize')}:
            </label>
            <Select
              onValueChange={(v) => {
                setSize(Number(v));
                setPage(0);
              }}
              value={String(size)}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setPage(page - 1)}
            disabled={page === 0 || isLoading}
          >
            {'<'}
          </Button>
          <span>
            {t('nachweis.page')} {page + 1} {t('nachweis.of')}{' '}
            {data?.totalPages || 0}
          </span>
          <Button
            onClick={() => setPage(page + 1)}
            disabled={
              page >= (data?.totalPages || 1) - 1 || isLoading
            }
          >
            {'>'}
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('nachweis.name')}</TableHead>
            <TableHead>{t('nachweis.startDate')}</TableHead>
            <TableHead>{t('nachweis.endDate')}</TableHead>
            <TableHead>{t('nachweis.status')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.content?.map((nachweis: Nachweis) => (
            <TableRow key={nachweis.id}>
              <TableCell>{nachweis.name}</TableCell>
              <TableCell>{nachweis.datumStart}</TableCell>
              <TableCell>{nachweis.datumEnde}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(nachweis.status)}>
                  {t(`nachweis.status${nachweis.status}`)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
