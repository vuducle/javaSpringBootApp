'use client';

import { useTranslation } from '@/context/LanguageContext';
import { useEffect, useState } from 'react';
import  api  from '@/lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { useAppSelector } from '@/store';
import { selectUser } from '@/store/slices/userSlice';

interface Nachweis {
  id: string;
  status: 'ANGENOMMEN' | 'IN_BEARBEITUNG' | 'ABGELEHNT';
  ausbilder: {
    id: string;
  };
}

const COLORS = {
  ANGENOMMEN: '#4CAF50',
  IN_BEARBEITUNG: '#FFC107',
  ABGELEHNT: '#F44336',
};

type TranslationKeys = `nachweis.status${'ANGENOMMEN' | 'IN_BEARBEITUNG' | 'ABGELEHNT'}`;

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }: { cx: number, cy: number, midAngle: number, innerRadius: number, outerRadius: number, value: number }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${value}`}
      </text>
    );
  };

export default function TrainerStatsCard() {
  const { t } = useTranslation();
  const [data, setData] = useState<Nachweis[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const user = useAppSelector(selectUser);

  useEffect(() => {
    const fetchNachweise = async () => {
      try {
        const response = await api.get('/api/nachweise/admin/all');
        const allNachweise = response.data.content;
        setTotalElements(response.data.totalElements);
        const trainerNachweise = allNachweise.filter(
          (nachweis: Nachweis) => nachweis.ausbilder?.id === user.id
        );
        setData(trainerNachweise);
      } catch (error) {
        console.error('Error fetching nachweise:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user.id) {
      fetchNachweise();
    } else {
      setLoading(false);
    }
  }, [user.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const stats = data.reduce(
    (acc, nachweis) => {
      acc[nachweis.status]++;
      return acc;
    },
    { ANGENOMMEN: 0, IN_BEARBEITUNG: 0, ABGELEHNT: 0 }
  );

  const chartData = Object.entries(stats).map(([name, value]) => ({
    name: t(`nachweis.status${name}` as TranslationKeys),
    value,
  }));

    return (
    <div className="bg-white dark:bg-zinc-800 shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">{t('nachweis.listTitle')} ({totalElements})</h2>
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
                <Cell key={`cell-${index}`} fill={COLORS[Object.keys(stats)[index] as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Legend formatter={(value, entry) => `${value} (${entry.payload.value})`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
