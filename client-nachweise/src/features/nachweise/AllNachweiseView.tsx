'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import api from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { useSWRConfig } from 'swr';
import { useTranslation } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Eye,
  Pen,
  Trash,
  Book,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import StatusPlaceholder from '@/components/ui/StatusPlaceholder';
import ConfirmDeleteDialog from '@/components/core/ConfirmDeleteDialog';

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

export function AllNachweiseView() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { mutate } = useSWRConfig();
  const [status, setStatus] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('datumStart');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  // per-row delete handled by ConfirmDeleteDialog
  const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
  const [deleteAllConfirmText, setDeleteAllConfirmText] =
    useState('');
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  // local loading state is not needed because SWR provides isLoading

  // per-row delete will be performed with ConfirmDeleteDialog per row

  const openDeleteAllModal = useCallback(() => {
    setDeleteAllConfirmText('');
    setDeleteAllModalOpen(true);
  }, []);

  const closeDeleteAllModal = useCallback(() => {
    setDeleteAllConfirmText('');
    setDeleteAllModalOpen(false);
  }, []);

  const confirmDeleteAll = useCallback(async () => {
    // require exact phrase
    if (deleteAllConfirmText.trim() !== 'sudo rm -rf') return;
    setIsDeletingAll(true);
    try {
      await api.delete('/api/nachweise/my-nachweise/all');
      showToast(t('nachweis.deleteAllSuccess'), 'success');
      // revalidate list (preserve current sorting)
      mutate([
        '/api/nachweise/my-nachweise',
        {
          status: status === 'ALL' ? undefined : status,
          page,
          size,
          sortBy,
          sortDir,
        },
      ]);
      closeDeleteAllModal();
    } catch (err) {
      console.error(err);
      showToast(
        t('nachweis.deleteAllError') || t('nachweis.errorMessage'),
        'error'
      );
    } finally {
      setIsDeletingAll(false);
      setDeleteAllConfirmText('');
    }
  }, [
    deleteAllConfirmText,
    mutate,
    status,
    page,
    size,
    sortBy,
    sortDir,
    showToast,
    t,
    closeDeleteAllModal,
  ]);

  const downloadAllNachweise = useCallback(async () => {
    setIsDownloadingAll(true);
    try {
      const resp = await api.get(
        '/api/nachweise/my-nachweise/all/zip',
        {
          responseType: 'blob',
        }
      );

      const contentType =
        resp.headers['content-type'] || 'application/zip';
      const blob = new Blob([resp.data], { type: contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `nachweise_all_${new Date()
        .toISOString()
        .slice(0, 10)}.zip`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast(
        t('nachweis.downloadSuccess') || 'Download started',
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast(
        t('nachweis.downloadError') || 'Fehler beim Download',
        'error'
      );
    } finally {
      setIsDownloadingAll(false);
    }
  }, [showToast, t]);

  // SWR with dedupe, caching, and automatic revalidation
  const { data, error, isLoading } = useSWR(
    [
      '/api/nachweise/my-nachweise',
      {
        status: status === 'ALL' ? undefined : status,
        page,
        size,
        sortBy,
        sortDir,
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
    <>
      <div className="container mx-auto p-4 py-5 md:py-10 lg:py-20">
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
                  <SelectTrigger className="w-[160px]">
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
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={() => openDeleteAllModal()}
              disabled={isLoading}
              className="ml-2 bg-destructive hover:bg-destructive/80 transition-all cursor-pointer dark:bg-chart-5 dark:hover:bg-chart-5/80"
            >
              <Book />
              {t('nachweis.deleteAll')}
            </Button>
            <Button
              size="sm"
              onClick={() => downloadAllNachweise()}
              disabled={isLoading || isDownloadingAll}
              className="ml-2 bg-primary/90 hover:bg-primary/80 transition-all"
            >
              <Download />
              {isDownloadingAll
                ? t('nachweis.downloading')
                : t('nachweis.downloadAll')}
            </Button>
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
                    errorImage="https://http.cat/status/400"
                    errorText={
                      t('nachweis.loadingError') ??
                      t('nachweis.errorMessage')
                    }
                  />
                </TableCell>
              </TableRow>
            ) : data?.content && data.content.length > 0 ? (
              // ---- IF-Teil: Daten sind vorhanden ----
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
                      <Button className="bg-chart-4 hover:bg-chart-4/80 dark:bg-chart-4 dark:hover:bg-chart-4/80 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        <Link href={`/nachweis/${nachweis.id}/edit`}>
                          <Pen />
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
                          // revalidate list
                          mutate([
                            '/api/nachweise/my-nachweise',
                            {
                              status:
                                status === 'ALL' ? undefined : status,
                              page,
                              size,
                              sortBy,
                              sortDir,
                            },
                          ]);
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
              // ---- ELSE-Teil: Keine Daten vorhanden (Placeholder) ----
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-muted-foreground"
                >
                  <div className="flex flex-col justify-center items-center">
                    <p className="text-lg">
                      {t('nachweis.noNachweiseFound')}
                    </p>
                    <p className="text-sm mt-1">
                      {t('nachweis.startAddingNachweis')}
                    </p>
                    <iframe
                      src="https://giphy.com/embed/3owzWm3tA6BqSKGQ1y"
                      width="320"
                      className="giphy-embed mt-2"
                      allowFullScreen
                    ></iframe>
                    <Link
                      href="/erstellen"
                      className="flex items-center cursor-pointer transition-all"
                    >
                      <Button className="mt-4 cursor-pointer transition-all">
                        <Plus />
                        {t('nachweis.nachweisErstellen')}
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete all Nachweise */}
      <Dialog
        open={deleteAllModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDeleteAllModal();
          } else {
            setDeleteAllModalOpen(true);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('nachweis.deleteAllTitle')}</DialogTitle>
            <DialogDescription>
              {t('nachweis.deleteAllDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              {t('nachweis.deleteAllTypeConfirm')}
            </div>
            <Input
              placeholder={t('nachweis.deleteAllPlaceholder')}
              value={deleteAllConfirmText}
              onChange={(e) =>
                setDeleteAllConfirmText(e.target.value)
              }
            />
          </div>
          <DialogFooter>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => closeDeleteAllModal()}
                disabled={isDeletingAll}
              >
                {t('nachweis.deleteCancel')}
              </Button>
              <Button
                className="bg-destructive"
                onClick={() => confirmDeleteAll()}
                disabled={
                  deleteAllConfirmText.trim() !== 'sudo rm -rf' ||
                  isDeletingAll
                }
              >
                {isDeletingAll
                  ? t('nachweis.deleting')
                  : t('nachweis.deleteAllConfirmButton')}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
