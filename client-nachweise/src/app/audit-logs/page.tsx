'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { selectUser } from '@/store/slices/userSlice';
import api from '@/lib/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import StatusPlaceholder from '@/components/ui/StatusPlaceholder';
import { useTranslation } from '@/context/LanguageContext';

interface AuditItem {
  id: string;
  nachweisId: string;
  aktion: string;
  aktionsZeit: string;
  benutzerName: string;
}

export default function AuditLogsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const isAusbilder =
    Array.isArray(user.roles) &&
    (user.roles.includes('ROLE_ADMIN') ||
      user.roles.includes('ROLE_AUSBILDER'));

  const [items, setItems] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'nachweis' | 'rollen' | 'byId'>(
    'nachweis'
  );
  const [searchId, setSearchId] = useState<string>('');
  // pagination for nachweis audit
  const [page, setPage] = useState<number>(0); // zero-based
  const [size, setSize] = useState<number>(10);
  const [total, setTotal] = useState<number | null>(null);

  // helper: normalize many audit shapes to AuditItem[]
  const normalizeAuditItems = (raw: unknown): AuditItem[] => {
    if (!raw) return [];
    const asRecord = raw as Record<string, unknown>;
    const arr = Array.isArray(raw)
      ? (raw as unknown[])
      : Array.isArray(asRecord['items'])
      ? (asRecord['items'] as unknown[])
      : Array.isArray(asRecord['data'])
      ? (asRecord['data'] as unknown[])
      : Array.isArray(
          (asRecord['audits'] as Record<string, unknown>)?.['items']
        )
      ? ((asRecord['audits'] as Record<string, unknown>)[
          'items'
        ] as unknown[]) ?? []
      : [];

    return arr.map((r: unknown) => {
      const obj = r as Record<string, unknown>;

      const timeVal =
        obj['aktionsZeit'] ??
        obj['performedAt'] ??
        obj['zeit'] ??
        obj['timestamp'] ??
        obj['createdAt'] ??
        obj['time'] ??
        obj['date'] ??
        null;

      const userNameVal =
        obj['benutzerName'] ??
        obj['performedBy'] ??
        obj['userName'] ??
        obj['username'] ??
        obj['changedBy'] ??
        obj['changedByName'] ??
        obj['name'] ??
        null;

      const actionVal =
        obj['aktion'] ??
        obj['action'] ??
        obj['details'] ??
        obj['message'] ??
        obj['role'] ??
        obj['rolle'] ??
        obj['change'] ??
        null;

      const relatedVal =
        obj['nachweisId'] ??
        obj['targetUsername'] ??
        obj['recordId'] ??
        obj['roleId'] ??
        obj['roleName'] ??
        obj['id'] ??
        null;

      return {
        id: String(obj['id'] ?? Math.random()),
        nachweisId: String(relatedVal ?? ''),
        aktion: String(actionVal ?? JSON.stringify(obj ?? {})),
        aktionsZeit: String(timeVal ?? new Date().toISOString()),
        benutzerName: String(userNameVal ?? ''),
      } as AuditItem;
    });
  };

  useEffect(() => {
    if (!isAusbilder) {
      // redirect non-admins
      router.replace('/');
      return;
    }

    const fetchAudit = async () => {
      setLoading(true);
      try {
        if (tab === 'nachweis') {
          const res = await api.get('/api/admin/nachweis-audit/', {
            params: { page, size },
          });
          const data = res.data;
          // handle common paginated shapes: { items, total } or { items, totalElements }
          const itemsData = Array.isArray(data.items)
            ? data.items
            : Array.isArray(data)
            ? (data as AuditItem[])
            : Array.isArray(data.data)
            ? data.data
            : Array.isArray(data?.audits?.items)
            ? data.audits.items
            : [];

          const sorted = (itemsData as AuditItem[]).sort(
            (a: AuditItem, b: AuditItem) =>
              new Date(b.aktionsZeit).getTime() -
              new Date(a.aktionsZeit).getTime()
          );
          setItems(sorted);

          // try to read total from known fields
          const totalCount =
            data.total ??
            data.totalElements ??
            data.meta?.total ??
            data?.audits?.total ??
            data?.audits?.totalElements ??
            null;
          if (typeof totalCount === 'number') setTotal(totalCount);
          else setTotal((itemsData as AuditItem[]).length ?? null);
        } else if (tab === 'rollen') {
          const res = await api.get('/api/admin/rollen-audit', {
            params: { page, size },
          });
          const data = res.data;
          const normalized = normalizeAuditItems(data);
          setItems(normalized);
          const totalCount =
            data?.total ??
            data?.totalElements ??
            data?.meta?.total ??
            data?.audits?.total ??
            data?.audits?.totalElements ??
            null;
          if (typeof totalCount === 'number') setTotal(totalCount);
          else setTotal(normalized.length);
        }
      } catch (err) {
        console.error('Error fetching audit logs', err);
        setItems([]);
        setTotal(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchAudit();
  }, [isAusbilder, router, tab, page, size]);

  // fetch other tabs when tab changes
  useEffect(() => {
    if (!isAusbilder) return;

    const fetchRoles = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/admin/rollen-audit');
        const data = res.data;
        console.log('Rollen audit data:', data);
        const normalized = normalizeAuditItems(data);
        setItems(normalized);
        // try to extract total if present
        const totalCount =
          data?.total ??
          data?.totalElements ??
          data?.meta?.total ??
          data?.audits?.total ??
          data?.audits?.totalElements ??
          null;
        if (typeof totalCount === 'number') setTotal(totalCount);
        else setTotal(normalized.length);
      } catch (err) {
        console.error('Error fetching rollen audit', err);
        setItems([]);
        setTotal(null);
      } finally {
        setLoading(false);
      }
    };

    if (tab === 'rollen') {
      void fetchRoles();
    }
  }, [tab, isAusbilder]);

  const fetchById = async (id: string) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(
        `/api/admin/nachweis-audit/${encodeURIComponent(id)}`
      );
      const data = res.data;
      if (Array.isArray(data.items)) setItems(data.items);
      else if (Array.isArray(data)) setItems(data as AuditItem[]);
      else if (data) setItems([data as AuditItem]);
      else setItems([]);
    } catch (err) {
      console.error('Error fetching nachweis by id', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAusbilder) return null; // redirecting

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <StatusPlaceholder
          loading
          loadingText={t('common.loading') ?? 'Loading'}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('auditTrail.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <div className="mb-4 flex items-center gap-3">
            <div className="inline-flex rounded-full bg-muted p-1">
              <button
                onClick={() => {
                  setTab('nachweis');
                  setPage(0);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  tab === 'nachweis'
                    ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white shadow'
                    : 'text-foreground/80 hover:text-foreground'
                }`}
              >
                {t('auditTrail.nachweisTab')}
              </button>
              <button
                onClick={() => {
                  setTab('rollen');
                  setPage(0);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  tab === 'rollen'
                    ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white shadow'
                    : 'text-foreground/80 hover:text-foreground'
                }`}
              >
                {t('auditTrail.rollenTab')}
              </button>
              <button
                onClick={() => {
                  setTab('byId');
                  setPage(0);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  tab === 'byId'
                    ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white shadow'
                    : 'text-foreground/80 hover:text-foreground'
                }`}
              >
                {t('auditTrail.byIdTab')}
              </button>
            </div>
            <div className="ml-auto text-sm text-muted-foreground">
              {tab === 'nachweis' &&
                `${t('auditTrail.time')}: ${t('auditTrail.user')}`}
            </div>
          </div>

          {tab === 'byId' && (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder={
                  t('auditTrail.searchPlaceholder') ?? 'Nachweis ID'
                }
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="border rounded p-2 w-full"
              />
              <button
                onClick={() => fetchById(searchId)}
                className="px-3 py-2 bg-primary text-white rounded"
              >
                {t('auditTrail.searchButton')}
              </button>
            </div>
          )}

          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('auditTrail.noEntries') ?? 'No audit entries found.'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto border rounded-md">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="text-left">
                      <th className="px-3 py-2">
                        {t('auditTrail.time')}
                      </th>
                      <th className="px-3 py-2">
                        {t('auditTrail.user')}
                      </th>
                      <th className="px-3 py-2">
                        {t('auditTrail.action')}
                      </th>
                      <th className="px-3 py-2">
                        {tab === 'rollen'
                          ? t('auditTrail.user')
                          : 'Nachweis'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr
                        key={it.id}
                        className={
                          'border-t ' +
                          (idx % 2 === 0 ? 'bg-white' : 'bg-muted/5')
                        }
                      >
                        <td className="px-3 py-3 align-top">
                          {new Date(it.aktionsZeit).toLocaleString()}
                        </td>
                        <td className="px-3 py-3 align-top">
                          {it.benutzerName}
                        </td>
                        <td className="px-3 py-3 align-top">
                          {it.aktion}
                        </td>
                        <td className="px-3 py-3 align-top font-mono text-xs">
                          {it.nachweisId}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {tab !== 'byId' && (
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    {(() => {
                      const start = page * size + 1;
                      const end = Math.min(
                        (page + 1) * size,
                        total ?? items.length
                      );
                      const totalDisplay = total ?? items.length;
                      const tpl =
                        t('auditTrail.showing') ??
                        'Showing {start}-{end} of {total}';
                      return tpl
                        .replace('{start}', String(start))
                        .replace('{end}', String(end))
                        .replace('{total}', String(totalDisplay));
                    })()}
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm">
                      {t('auditTrail.perPage')}
                    </label>
                    <select
                      value={size}
                      onChange={(e) => {
                        const newSize = Number(e.target.value) || 10;
                        setSize(newSize);
                        setPage(0);
                      }}
                      className="border rounded p-1"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>

                    <button
                      onClick={() =>
                        setPage((p) => Math.max(0, p - 1))
                      }
                      disabled={page <= 0}
                      className="px-3 py-1 rounded bg-transparent hover:bg-accent disabled:opacity-50"
                    >
                      {t('auditTrail.prev')}
                    </button>

                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={
                        total !== null &&
                        (page + 1) * size >= (total ?? 0)
                      }
                      className="px-3 py-1 rounded bg-transparent hover:bg-accent disabled:opacity-50"
                    >
                      {t('auditTrail.next')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
