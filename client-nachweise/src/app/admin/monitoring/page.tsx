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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import StatusPlaceholder from '@/components/ui/StatusPlaceholder';
import { useTranslation } from '@/context/LanguageContext';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface CacheStats {
  hitRate: string;
  totalHits?: number;
  totalMisses?: number;
  cacheHits?: number;
  cacheMisses?: number;
  sessionHits?: number;
  sessionMisses?: number;
  sessionHitRate?: string;
  appCacheHitRate?: string;
  cacheNames?: Record<string, { hits: number; misses: number }>;
}

interface RedisInfo {
  totalKeys?: number;
  sessionKeys?: number;
  rateLimitKeys?: number;
  status?: string;
  [key: string]: unknown;
}

export default function MonitoringPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAppSelector(selectUser);

  const isAusbilder =
    Array.isArray(user.roles) &&
    (user.roles.includes('ROLE_ADMIN') ||
      user.roles.includes('ROLE_AUSBILDER'));

  const [cacheStats, setCacheStats] = useState<CacheStats | null>(
    null
  );
  const [redisInfo, setRedisInfo] = useState<RedisInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!isAusbilder) {
      router.push('/');
      return;
    }
    fetchMonitoringData();
  }, [isAusbilder, router]);

  const fetchMonitoringData = async () => {
    try {
      setError(null);
      setRefreshing(true);

      const [cacheResponse, redisResponse] = await Promise.all([
        api.get('/api/monitoring/cache/stats'),
        api.get('/api/monitoring/redis/info'),
      ]);

      setCacheStats(cacheResponse.data);
      setRedisInfo(redisResponse.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Fehler beim Laden der Monitoring-Daten'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (!isAusbilder) {
    return null;
  }

  if (loading) {
    return (
      <StatusPlaceholder
        loading={true}
        loadingText="Monitoring-Daten werden geladen..."
      />
    );
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">🔍 System Monitoring</h1>
          <p className="text-muted-foreground mt-2">
            Cache und Redis Performance Übersicht
          </p>
        </div>
        <button
          onClick={fetchMonitoringData}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
          {refreshing ? 'Aktualisiert...' : 'Aktualisieren'}
        </button>
      </div>

      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {lastUpdated && (
        <p className="text-sm text-muted-foreground mb-4">
          Zuletzt aktualisiert:{' '}
          {lastUpdated.toLocaleTimeString('de-DE')}
        </p>
      )}

      <Tabs defaultValue="cache" className="space-y-6">
        <TabsList>
          <TabsTrigger value="cache">💾 Cache Stats</TabsTrigger>
          <TabsTrigger value="redis">🔴 Redis Info</TabsTrigger>
        </TabsList>

        <TabsContent value="cache" className="space-y-6">
          {cacheStats ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Hit Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {typeof cacheStats.hitRate === 'string'
                        ? cacheStats.hitRate
                        : `${(cacheStats.hitRate * 100).toFixed(2)}%`}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Effizienz des Caches
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Cache Hits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {(cacheStats.cacheHits ?? 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      App Cache Zugriffe
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Cache Misses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600">
                      {(cacheStats.cacheMisses ?? 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Fehlgeschlagene Zugriffe
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Session Hits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-cyan-600">
                      {(cacheStats.sessionHits ?? 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {cacheStats.sessionHitRate &&
                        `${cacheStats.sessionHitRate}`}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Session Misses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">
                      {(
                        cacheStats.sessionMisses ?? 0
                      ).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Fehlgeschlagene Session-Zugriffe
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <StatusPlaceholder
              error={true}
              errorText="Keine Cache-Daten verfügbar"
            />
          )}
        </TabsContent>

        <TabsContent value="redis" className="space-y-6">
          {redisInfo ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Total Keys
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">
                      {(redisInfo.totalKeys ?? 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Keys in Redis
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Session Keys
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {(redisInfo.sessionKeys ?? 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Aktive Sessions
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Rate Limit Keys
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">
                      {(
                        redisInfo.rateLimitKeys ?? 0
                      ).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Rate-Limit Einträge
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Redis Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        redisInfo.status === 'Connected'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    />
                    <p className="text-lg font-semibold">
                      {redisInfo.status}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <StatusPlaceholder
              error={true}
              errorText="Keine Redis-Daten verfügbar"
            />
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
