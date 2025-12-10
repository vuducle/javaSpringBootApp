'use client';

import { useTranslation } from '@/context/LanguageContext';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import StatusPlaceholder from '@/components/ui/StatusPlaceholder';

interface Nachweis {
  id: number;
  status: 'ANGENOMMEN' | 'IN_BEARBEITUNG' | 'ABGELEHNT';
}

const STATUS_META: Record<string, { color: string; emoji: string }> =
  {
    ANGENOMMEN: { color: '#34d399', emoji: '✅' }, // emerald
    IN_BEARBEITUNG: { color: '#60a5fa', emoji: '⏳' }, // sky
    ABGELEHNT: { color: '#fb7185', emoji: '❌' }, // rose
  };

export default function StatsCard() {
  const { t } = useTranslation();
  const [data, setData] = useState<Nachweis[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNachweise = async () => {
      try {
        const response = await api.get('/api/nachweise/my-nachweise');
        setData(response.data.content);
      } catch (err) {
        console.error('Error fetching nachweise:', err);
        const message =
          (err as unknown as { message?: string })?.message ??
          'Fehler beim Laden';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchNachweise();
  }, []);

  if (loading) {
    return (
      <StatusPlaceholder
        loading
        loadingText={t('common.loading') ?? 'Lädt...'}
      />
    );
  }

  if (error) {
    return (
      <StatusPlaceholder
        error={error}
        errorImage="https://http.cat/status/400"
        errorText={error}
      />
    );
  }

  const stats = data.reduce(
    (acc, nachweis) => {
      acc[nachweis.status]++;
      return acc;
    },
    { ANGENOMMEN: 0, IN_BEARBEITUNG: 0, ABGELEHNT: 0 }
  );

  const chartData = Object.entries(stats).map(([name, value]) => ({
    key: name,
    name: `${STATUS_META[name].emoji} ${t(`nachweis.status${name}`)}`,
    value,
  }));

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    value,
  }: {
    cx: number;
    cy: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    value?: number;
  }) => {
    const iRadius = innerRadius ?? 0;
    const oRadius = outerRadius ?? 0;
    const mAngle = midAngle ?? 0;
    const val = value ?? 0;
    const radius = iRadius + (oRadius - iRadius) * 0.5;
    const x = cx + radius * Math.cos(-mAngle * RADIAN);
    const y = cy + radius * Math.sin(-mAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {`${val}`}
      </text>
    );
  };

  return (
    <div className="bg-white/60 dark:bg-zinc-800/50 backdrop-blur-md border border-white/20 dark:border-zinc-700/40 shadow-lg rounded-2xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-primary">
        📊 {t('nachweis.listTitle')}
      </h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={STATUS_META[entry.key].color}
                />
              ))}
            </Pie>
            <Legend
              formatter={(
                value,
                entry?: {
                  payload?: { name?: string; value?: number };
                }
              ) => {
                const label = entry?.payload?.name ?? value;
                const count = entry?.payload?.value;
                return count !== undefined
                  ? `${label} (${count})`
                  : String(label);
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
