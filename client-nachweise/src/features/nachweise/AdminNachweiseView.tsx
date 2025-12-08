'use client';

import { useState } from 'react';
import useSWR from 'swr';
import api from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/context/LanguageContext';
import { useAppSelector } from '@/store';
import { selectUser } from '@/store/slices/userSlice';
import useTrainers from '@/hooks/useTrainers';
import useAzubis from '@/hooks/useAzubis';
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
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar';
import {
  Eye,
  Trash,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import StatusPlaceholder from '@/components/ui/StatusPlaceholder';
import ConfirmDeleteDialog from '@/components/core/ConfirmDeleteDialog';
import { useSWRConfig } from 'swr';

interface Nachweis {
  id: string;
  name: string;
  datumStart: string;
  datumEnde: string;
  status: 'ANGENOMMEN' | 'ABGELEHNT' | 'IN_BEARBEITUNG';
  nummer?: number;
  comment?: string;
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

export function AdminNachweiseView() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);
  const { trainers } = useTrainers();
  const { azubis } = useAzubis();
  const [status, setStatus] = useState<string>('ALL');
  const [ausbilderId, setAusbilderId] = useState<string>(
    () => user?.id || 'ALL'
  );
  const [azubiId, setAzubiId] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('datumStart');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const { mutate } = useSWRConfig();

  // per-row delete handled via ConfirmDeleteDialog component

  // SWR with dedupe, caching, and automatic revalidation
  const { data, error, isLoading } = useSWR(
    azubiId && azubiId !== 'ALL'
      ? [
          `/api/nachweise/admin/user/${azubiId}`,
          {
            status: status === 'ALL' ? undefined : status,
            page,
            size,
            sortBy,
            sortDir,
          },
        ]
      : [
          '/api/nachweise/admin/all',
          {
            status: status === 'ALL' ? undefined : status,
            ausbilderId:
              ausbilderId === 'ALL' ? undefined : ausbilderId,
            page,
            size,
            sortBy,
            sortDir,
          },
        ],
    (args: [string, Record<string, unknown>]) =>
      fetcher(args[0], args[1]),
    {
      dedupingInterval: 2000,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      keepPreviousData: true,
      onError: () => {
        showToast(t('nachweis.errorMessage'), 'error');
      },
    }
  );

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

  // per-row delete will be handled inline using ConfirmDeleteDialog

  return (
    <>
      <div className="container mx-auto p-4 py-5 md:py-10 lg:py-20">
        <div className="mb-4 p-4 rounded-md bg-slate-50 dark:bg-slate-800 border">
          <strong>
            {t('nachweis.adminBannerTitle') || 'Admin View'}
          </strong>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            {t('nachweis.adminBannerDescription') ||
              'Administrative controls are available.'}
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-4">
          {t('nachweis.allNachweise')}
        </h1>
        <div className="flex justify-between items-center flex-wrap mb-4">
          <div className="flex items-center space-x-2">
            <Select onValueChange={setStatus} value={status}>
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  placeholder={t('nachweis.filterStatus')}
                />
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
            <Select
              onValueChange={(v) => {
                setAusbilderId(v);
                setPage(0);
              }}
              value={ausbilderId}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('profile.trainer')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">
                  {t('userPage.all')}
                </SelectItem>
                {trainers.map((trainer) => (
                  <SelectItem
                    key={trainer.id || trainer.username}
                    value={trainer.id || trainer.username || ''}
                  >
                    {trainer.name || trainer.username}
                  </SelectItem>
                ))}
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
              <div className="flex items-center space-x-2">
                <label className="text-sm">
                  {t('nachweis.sortBy') ?? 'Sort by'}:
                </label>
                <Select
                  onValueChange={(v) => {
                    setSortBy(v);
                    setPage(0);
                  }}
                  value={sortBy}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue
                      placeholder={t('nachweis.sortBy') ?? 'Sort by'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="datumStart">
                      {t('nachweis.startDate')}
                    </SelectItem>
                    <SelectItem value="datumEnde">
                      {t('nachweis.endDate')}
                    </SelectItem>
                    <SelectItem value="nummer">
                      {t('nachweis.nummer')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  aria-label={
                    sortDir === 'asc'
                      ? 'Sort ascending'
                      : 'Sort descending'
                  }
                  onClick={() => {
                    setSortDir((s) => (s === 'asc' ? 'desc' : 'asc'));
                    setPage(0);
                  }}
                >
                  {sortDir === 'asc' ? (
                    <ChevronUp />
                  ) : (
                    <ChevronDown />
                  )}
                </Button>
              </div>
            </div>
            <Select
              onValueChange={(v) => {
                setAzubiId(v);
                setPage(0);
              }}
              value={azubiId}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('nachweis.azubi')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">
                  {t('userPage.all')}
                </SelectItem>
                {Array.isArray(azubis) &&
                  azubis.map((azubi) => (
                    <SelectItem
                      key={azubi.id || azubi.username}
                      value={azubi.id || azubi.username || ''}
                    >
                      {azubi.name || azubi.username}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setPage(page - 1)}
              disabled={page === 0 || isLoading}
            >
              <ChevronLeft />
            </Button>
            <span>
              {t('nachweis.page')} {page + 1} {t('nachweis.of')}{' '}
              {data?.totalPages || 1}
            </span>

            <Button
              onClick={() => setPage(page + 1)}
              disabled={
                page >= (data?.totalPages || 1) - 1 || isLoading
              }
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
        <Table className="bg-sidebar-primary-foreground dark:bg-muted rounded-lg p-2">
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
                {t('nachweis.kommentar')}
              </TableHead>
              <TableHead className="text-xs uppercase text-muted-foreground">
                {t('nachweis.aktion')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  <StatusPlaceholder
                    loading
                    loadingText={t('common.loading') ?? 'Lädt...'}
                  />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  <StatusPlaceholder
                    error
                    errorImage="https://http.cat/status/404.jpg"
                    errorText={
                      t('nachweis.loadingError') ??
                      t('nachweis.errorMessage')
                    }
                  />
                </TableCell>
              </TableRow>
            ) : data?.content && data.content.length > 0 ? (
              data?.content?.map((nachweis: Nachweis) => (
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
                  <TableCell className="text-sm text-muted-foreground">
                    {nachweis.comment}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-between">
                      <Button
                        asChild
                        className="bg-chart-3 hover:bg-chart-3/80 dark:bg-chart-2 dark:hover:bg-chart-2/80 cursor-pointer transition-all"
                      >
                        <Link href={`/nachweis/${nachweis.id}`}>
                          <Eye />
                        </Link>
                      </Button>
                      <ConfirmDeleteDialog
                        onConfirm={async () => {
                          const deleteId = nachweis.id;
                          await api.delete(
                            `/api/nachweise/${deleteId}`
                          );
                          showToast(
                            t('nachweis.deleteSuccess'),
                            'success'
                          );
                          const key =
                            azubiId && azubiId !== 'ALL'
                              ? [
                                  `/api/nachweise/admin/user/${azubiId}`,
                                  {
                                    status:
                                      status === 'ALL'
                                        ? undefined
                                        : status,
                                    page,
                                    size,
                                    sortBy,
                                    sortDir,
                                  },
                                ]
                              : [
                                  '/api/nachweise/admin/all',
                                  {
                                    status:
                                      status === 'ALL'
                                        ? undefined
                                        : status,
                                    ausbilderId:
                                      ausbilderId === 'ALL'
                                        ? undefined
                                        : ausbilderId,
                                    page,
                                    size,
                                    sortBy,
                                    sortDir,
                                  },
                                ];
                          mutate(key);
                        }}
                      >
                        <Button className="bg-destructive hover:bg-destructive/80 dark:bg-chart-5 dark:hover:bg-chart-5/80 cursor-pointer transition-all">
                          <Trash />
                        </Button>
                      </ConfirmDeleteDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-6 text-muted-foreground"
                >
                  <div className="flex flex-col justify-center items-center">
                    <p className="text-lg">
                      {t('nachweis.noNachweiseFound')}
                    </p>
                    <iframe
                      src="https://giphy.com/embed/3owzWm3tA6BqSKGQ1y"
                      width="320"
                      className="giphy-embed mt-2"
                      allowFullScreen
                    ></iframe>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
