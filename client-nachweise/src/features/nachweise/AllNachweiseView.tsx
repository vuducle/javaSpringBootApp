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
// Badge removed: using emoji for status
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar';
import {Eye, Pen, Trash} from "lucide-react";

interface Nachweis {
  id: string;
  name: string;
  datumStart: string;
  datumEnde: string;
  status: 'ANGENOMMEN' | 'ABGELEHNT' | 'IN_BEARBEITUNG';
  nummer?: number;
  ausbilder?: {
    id: string;
    name: string;
    profileImageUrl?: string | null;
  };
  azubi?: {
    id: string;
    name: string;
    profileImageUrl?: string | null;
  };
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
  const { data, isLoading } = useSWR(
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

  // status variants replaced by emoji in getStatusEmoji

  const getStatusEmoji = (status: Nachweis['status']) => {
    switch (status) {
      case 'ANGENOMMEN':
        return '✅';
      case 'ABGELEHNT':
        return '❌';
      case 'IN_BEARBEITUNG':
        return '⏳';
      default:
        return 'ℹ️';
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
      <Table className="bg-gradient-to-r from-pink-50/40 via-violet-50/40 to-cyan-50/40 rounded-lg p-2">
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs uppercase text-muted-foreground">
              {t('nachweis.nummer')}
            </TableHead>
            <TableHead className="text-xs uppercase text-muted-foreground">
              {t('nachweis.name')}
            </TableHead>
            <TableHead className="text-xs uppercase text-muted-foreground">
              {t('profile.trainer')}
            </TableHead>
            <TableHead className="text-xs uppercase text-muted-foreground">
              {t('nachweis.startDate')}
            </TableHead>
            <TableHead className="text-xs uppercase text-muted-foreground">
              {t('nachweis.endDate')}
            </TableHead>
            <TableHead className="text-xs uppercase text-muted-foreground">
              {t('nachweis.status')}
            </TableHead>
              <TableHead className="text-xs uppercase text-muted-foreground">
                  {t('nachweis.aktion')}
              </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.content?.map((nachweis: Nachweis) => (
            <TableRow
              key={nachweis.id}
              className="group bg-white/60 dark:bg-slate-800/60 rounded-lg mb-3 shadow-sm hover:shadow-lg transition-shadow transform hover:-translate-y-0.5"
            >
              <TableCell className="w-12 text-lg font-semibold text-violet-600">
                {nachweis.nummer ?? '-'}
              </TableCell>
              <TableCell>
                {nachweis.azubi ? (
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12 ring-1 ring-violet-100">
                      {nachweis.azubi.profileImageUrl ? (
                        <AvatarImage
                          src={`${
                            process.env.NEXT_PUBLIC_API_URL ||
                            'http://localhost:8088'
                          }${nachweis.azubi.profileImageUrl}`}
                          className="object-cover"
                          alt={nachweis.azubi.name}
                        />
                      ) : (
                        <AvatarFallback className="text-sm">
                          {nachweis.azubi.name
                            .split(' ')
                            .map((n) => n.charAt(0))
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm">
                        {nachweis.azubi.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t('nachweis.azubi')}
                      </div>
                    </div>
                  </div>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                {nachweis.ausbilder ? (
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 ring-1 ring-pink-50">
                      {nachweis.ausbilder.profileImageUrl ? (
                        <AvatarImage
                          src={`${
                            process.env.NEXT_PUBLIC_API_URL ||
                            'http://localhost:8088'
                          }${nachweis.ausbilder.profileImageUrl}`}
                          alt={nachweis.ausbilder.name}
                          className="object-cover"
                        />
                      ) : (
                        <AvatarFallback className="text-sm">
                          {nachweis.ausbilder.name
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="font-medium text-sm text-foreground">
                      {nachweis.ausbilder.name}
                    </div>
                  </div>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {nachweis.datumStart}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {nachweis.datumEnde}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                    nachweis.status === 'ANGENOMMEN'
                      ? 'bg-emerald-50 text-emerald-700'
                      : nachweis.status === 'ABGELEHNT'
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  <span aria-hidden>
                    {getStatusEmoji(nachweis.status)}
                  </span>
                  <span>
                    {t(`nachweis.status${nachweis.status}`)}
                  </span>
                </span>
              </TableCell>
                <TableCell>
                    <div className="flex justify-between">
                        <Button disabled={true} className="bg-chart-3 hover:bg-chart-3/80 dark:bg-chart-2 dark:hover:bg-chart-2/80 cursor-pointer transition-all">
                            <Eye />
                        </Button>
                        <Button disabled={true} className="bg-chart-4 hover:bg-chart-4/80 dark:bg-chart-4 dark:hover:bg-chart-4/80 cursor-pointer transition-all">
                            <Pen />
                        </Button>
                        <Button className="bg-destructive hover:bg-destructive/80 dark:bg-chart-5 dark:hover:bg-chart-5/80 cursor-pointer transition-all">
                            <Trash />
                        </Button>
                    </div>
                </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
