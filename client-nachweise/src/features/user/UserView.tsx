'use client';
import { useTranslation } from '@/context/LanguageContext';
import AdminOnly from '@/components/core/AdminOnly';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import useSWR, { useSWRConfig } from 'swr';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import CreateUserModal from '@/features/user/CreateUserModal';
import useTrainers from '@/hooks/useTrainers';
import EditUserModal from '@/features/user/EditUserModal';
import { useToast } from '@/hooks/useToast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Trash,
} from 'lucide-react';
import DeleteConfirmModal from '@/components/core/DeleteConfirmModal';
import {
  Table,
  TableBody,
  TableHeader,
  TableHead,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import StatusPlaceholder from '@/components/ui/StatusPlaceholder';

interface Benutzer {
  id: string;
  username: string;
  name: string;
  email: string;
  profileImageUrl: string;
  ausbildungsjahr: number;
  telefonnummer: string;
  trainer?: {
    id: string;
    name: string;
    email: string;
  };
  roles: string[];
}

interface BenutzerResponse {
  content: Benutzer[];
  totalPages: number;
}

const fetcher = async (
  url: string,
  params: Record<string, unknown>
) => {
  const res = await api.get<BenutzerResponse>(url, { params });
  console.log(res);
  return res.data;
};

export default function UserView() {
  const { t } = useTranslation();

  const { mutate } = useSWRConfig();
  const { showToast } = useToast();

  const [status, setStatus] = useState<string>('ALLE');
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(10);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(
    null
  );
  const [showDeleteResult, setShowDeleteResult] = useState(false);
  const [deleteResult, setDeleteResult] = useState<{
    message?: string;
    affectedTraineesCount?: number;
    affectedTraineeUsernames?: string[];
  } | null>(null);

  // Map UI filter values to backend role names
  const roleParam = (() => {
    if (status === 'ALLE') return undefined;
    if (status === 'USER') return 'ROLE_USER';
    if (status === 'ADMIN') return 'ROLE_ADMIN';
    return undefined;
  })();

  // construct SWR key so we can mutate it after creating a user
  const swrKey = [
    '/api/user/users',
    {
      page,
      size,
      rolle: roleParam,
      sort: sortBy && `${sortBy},${sortDir}`,
      search: debouncedQuery || undefined,
    },
    status,
    sortBy,
    sortDir,
    debouncedQuery,
  ];

  const { data, error, isLoading } = useSWR(
    swrKey,
    (args: unknown) => {
      const [url, params] = args as [string, Record<string, unknown>];
      return fetcher(url, params);
    },
    {
      dedupingInterval: 2000,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      keepPreviousData: true,
    }
  );

  // use shared trainers hook
  const { trainersMap } = useTrainers();

  // debounce searchQuery -> debouncedQuery
  useEffect(() => {
    const id = setTimeout(
      () => setDebouncedQuery(searchQuery.trim()),
      400
    );
    return () => clearTimeout(id);
  }, [searchQuery]);

  return (
    <AdminOnly>
      <div className="container mx-auto p-4 py-5 md:py-10 lg:py-20">
        <h1 className="text-2xl font-bold mb-4">
          {t('userPage.title')}
        </h1>
        <div className="flex flex-col md:flex-row justify-between flex-wrap mb-4">
          <div className="flex lg:items-center flex-col lg:flex-row space-x-2">
            <Select
              value={status}
              onValueChange={(val: string) => {
                setStatus(val);
                setPage(0);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('userPage.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALLE">
                  {t('userPage.all')}
                </SelectItem>
                <SelectItem value="USER">
                  {t('userPage.azubis')}
                </SelectItem>
                <SelectItem value="ADMIN">
                  {t('userPage.ausbilder')}
                </SelectItem>
              </SelectContent>
            </Select>

            <label className="text-sm">
              {t('nachweis.pageSize')}:
            </label>
            <Select
              value={String(size)}
              onValueChange={(val: string) => {
                const parsed = Number(val) || 10;
                setSize(parsed);
                setPage(0);
              }}
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

            <label className="text-sm">
              {t('userPage.sortBy') ?? 'Sort By'}
            </label>
            <Select
              value={sortBy}
              onValueChange={(val: string) => {
                setSortBy(val || undefined);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('userPage.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="username">
                  {t('userPage.user')}
                </SelectItem>
                <SelectItem value="ausbildungsjahr">
                  {t('userPage.year')}
                </SelectItem>
                <SelectItem value="team">{'Team'}</SelectItem>
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
              {sortDir === 'asc' ? <ChevronUp /> : <ChevronDown />}
            </Button>

            <div className="w-64">
              <Input
                placeholder={
                  t('userSearch.placeholder') ?? 'Name or username...'
                }
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(
                    (e.target as HTMLInputElement).value
                  );
                  setPage(0);
                }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <CreateUserModal
              onCreated={() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                mutate(swrKey as any);
              }}
            />

            <div className="flex items-center">
              <Button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page <= 0}
              >
                <ChevronLeft />
              </Button>

              <span id="pageIndex" className="px-3 text-sm">
                {t('nachweis.page') ?? 'Seite'} {page + 1}{' '}
                {t('nachweis.of') ?? 'von'} {data?.totalPages ?? '-'}
              </span>

              <Button
                onClick={() =>
                  setPage((p) =>
                    Math.min((data?.totalPages ?? 1) - 1, p + 1)
                  )
                }
                disabled={data ? page >= data.totalPages - 1 : true}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </div>
        <Table className="bg-sidebar-primary-foreground dark:bg-muted rounded-lg p-2">
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs uppercase text-muted-foreground">
                {t('userPage.year')}
              </TableHead>
              <TableHead className="text-xs uppercase text-muted-foreground">
                Name
              </TableHead>
              <TableHead className="text-xs uppercase text-muted-foreground">
                {t('userPage.user')}
              </TableHead>
              <TableHead className="text-xs uppercase text-muted-foreground">
                E-Mail
              </TableHead>
              <TableHead className="text-xs uppercase text-muted-foreground">
                {t('userPage.nummer')}
              </TableHead>
              <TableHead className="text-xs uppercase text-muted-foreground">
                {t('userPage.role')}
              </TableHead>
              <TableHead className="text-xs uppercase text-muted-foreground">
                Team
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
              data?.content?.map((java: Benutzer) => (
                // Hier kommt der Part mit den DATEN, brrrrrrrr, brummmmm
                <TableRow
                  key={java.id}
                  className="group bg-white/60 dark:bg-slate-800/60 rounded-lg mb-3 shadow-sm hover:shadow-lg transition-shadow transform hover:-translate-y-0.5"
                >
                  <TableCell className="text-sm">
                    {java.ausbildungsjahr ?? '-'}
                  </TableCell>
                  <TableCell>
                    {java ? (
                      <div className="flex items-center space-x-3 mr-2">
                        {java.profileImageUrl ? (
                          <button
                            type="button"
                            aria-label={
                              t('userPage.previewImage') ??
                              'Preview image'
                            }
                            onClick={() =>
                              setLightboxImage(
                                `${
                                  process.env.NEXT_PUBLIC_API_URL ||
                                  'http://localhost:8088'
                                }${java.profileImageUrl}`
                              )
                            }
                            className="p-0 m-0"
                          >
                            <Avatar className="h-12 w-12 ring-1 ring-violet-100 mr-2">
                              <AvatarImage
                                src={`${
                                  process.env.NEXT_PUBLIC_API_URL ||
                                  'http://localhost:8088'
                                }${java.profileImageUrl}`}
                                className="object-cover mr-2"
                                alt={java.name}
                              />
                            </Avatar>
                          </button>
                        ) : (
                          <Avatar className="h-12 w-12 ring-1 ring-violet-100">
                            <AvatarFallback className="text-sm">
                              {java.name
                                .split(' ')
                                .map((n) => n.charAt(0))
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <div className="font-semibold text-sm">
                            {java.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Test
                          </div>
                        </div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{java.username}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{java.email}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {java.telefonnummer ?? '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm uppercase bg-primary p-2 rounded-md text-white">
                      {(() => {
                        const role = Array.isArray(java.roles)
                          ? java.roles[0]
                          : (java.roles as unknown as string);
                        if (!role) return '-';
                        if (role.includes('ADMIN'))
                          return t('roles.admin');
                        if (role.includes('USER'))
                          return t('roles.user');
                        return role;
                      })()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {java.trainer?.name || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-between">
                      <EditUserModal
                        user={java}
                        onUpdated={() => {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          mutate(swrKey as any);
                        }}
                      />
                      <>
                        <DeleteConfirmModal
                          requiredConfirmation={`sudo rm -rf && echo "${java.username}"`}
                          onConfirm={async () => {
                            try {
                              const resp = await api.delete(
                                `/api/user/${encodeURIComponent(
                                  java.username
                                )}`
                              );
                              const data = resp.data as {
                                message?: string;
                                affectedTraineesCount?: number;
                                affectedTraineeUsernames?: string[];
                              };
                              // show toast
                              showToast(
                                data?.message ||
                                  t('userPage.deleteSuccess') ||
                                  'User deleted',
                                'success'
                              );
                              // show result dialog with details if any
                              setDeleteResult(data || null);
                              setShowDeleteResult(true);
                              // refresh list
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              mutate(swrKey as any);
                            } catch (e) {
                              console.error(
                                'Failed to delete user',
                                e
                              );
                              const errData = e as {
                                response?: {
                                  data?: { message?: string };
                                };
                                message?: string;
                              };
                              const errMsg =
                                errData?.response?.data?.message ||
                                errData?.message ||
                                String(e);
                              showToast(
                                errMsg ||
                                  t('userPage.deleteFailed') ||
                                  'Failed to delete user',
                                'error'
                              );
                            }
                          }}
                        >
                          <Button className="bg-destructive hover:bg-destructive/80 dark:bg-chart-5 dark:hover:bg-chart-5/80 cursor-pointer transition-all">
                            <Trash />
                          </Button>
                        </DeleteConfirmModal>
                      </>
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
                    <p className="text-lg">Keine Daten vorhanden.</p>

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
        {lightboxImage ? (
          <Lightbox
            open={!!lightboxImage}
            close={() => setLightboxImage(null)}
            slides={[{ src: lightboxImage }]}
          />
        ) : null}

        {/* Delete Result Dialog */}
        <Dialog
          open={showDeleteResult}
          onOpenChange={setShowDeleteResult}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {deleteResult?.message ??
                  (t('userPage.deleteResultTitle') ||
                    'Delete result')}
              </DialogTitle>
              <DialogDescription>
                {deleteResult &&
                deleteResult.affectedTraineesCount !== undefined ? (
                  <>
                    {t('userPage.deleteResultDescription') ||
                      'Affected trainees:'}
                    <div className="mt-2">
                      <strong>
                        {deleteResult.affectedTraineesCount}
                      </strong>{' '}
                      {t('userPage.affectedTraineesLabel') ||
                        'trainee(s) affected'}
                    </div>
                  </>
                ) : (
                  t('userPage.deleteNoAffected') ||
                  'No affected trainees.'
                )}
              </DialogDescription>
            </DialogHeader>

            {deleteResult?.affectedTraineeUsernames &&
              deleteResult.affectedTraineeUsernames.length > 0 && (
                <div className="mt-4 max-h-60 overflow-auto">
                  <ul className="list-disc list-inside">
                    {deleteResult.affectedTraineeUsernames.map(
                      (u) => (
                        <li key={u} className="text-sm">
                          {u}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

            <DialogFooter>
              <Button onClick={() => setShowDeleteResult(false)}>
                {t('common.ok') ?? 'OK'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminOnly>
  );
}
