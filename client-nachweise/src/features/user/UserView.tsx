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
import { useToast } from '@/hooks/useToast';
import useSWR, { useSWRConfig } from 'swr';
import { useState } from 'react';
import api from '@/lib/api';
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Pen,
  Plus,
  Trash,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableHeader,
  TableHead,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import StatusPlaceholder from '@/components/ui/StatusPlaceholder';

interface Benutzer {
  id: string;
  username: string;
  name: string;
  email: string;
  profileImageUrl: string;
  ausbildungsjahr: number;
  telefonnummer: string;
  team: string;
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
  const { showToast } = useToast();
  const { mutate } = useSWRConfig();
  const [status, setStatus] = useState<string>('ALLE');
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(10);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Map UI filter values to backend role names
  const roleParam = (() => {
    if (status === 'ALLE') return undefined;
    if (status === 'USER') return 'ROLE_USER';
    if (status === 'ADMIN') return 'ROLE_ADMIN';
    return undefined;
  })();

  const { data, error, isLoading } = useSWR(
    [
      '/api/user/users',
      {
        page,
        size,
        rolle: roleParam,
        sort: sortBy && `${sortBy},${sortDir}`,
      },
      status,
      sortBy,
      sortDir,
    ],
    ([url, params]) => fetcher(url, params),
    {
      dedupingInterval: 2000,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      keepPreviousData: true,
    }
  );

  return (
    <AdminOnly>
      <div className="container mx-auto p-4 py-5 md:py-10 lg:py-20">
        <h1 className="text-2xl font-bold mb-4">
          {t('userPage.title')}
        </h1>
        <div className="flex flex-col md:flex-row justify-between flex-wrap mb-4">
          <div className="flex items-center space-x-2">
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
          </div>
          <div className="flex items-center space-x-2">
            {/*TODO: Hier kommt ein Suchfeld nach Namen oder Benutzername */}
          </div>
          <div className="flex items-center space-x-2"></div>
          <div className="flex items-center space-x-2">
            {/* Pagination controls */}
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
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12 ring-1 ring-violet-100">
                          {java.profileImageUrl ? (
                            <AvatarImage
                              src={`${
                                process.env.NEXT_PUBLIC_API_URL ||
                                'http://localhost:8088'
                              }${java.profileImageUrl}`}
                              className="object-cover"
                              alt={java.name}
                            />
                          ) : (
                            <AvatarFallback className="text-sm">
                              {java.name
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
                    <span className="text-sm">{java.team}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-between">
                      <Button className="bg-chart-4 hover:bg-chart-4/80 dark:bg-chart-4 dark:hover:bg-chart-4/80 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        <Pen />
                      </Button>
                      <Button className="bg-destructive hover:bg-destructive/80 dark:bg-chart-5 dark:hover:bg-chart-5/80 cursor-pointer transition-all">
                        <Trash />
                      </Button>
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
      </div>
    </AdminOnly>
  );
}
