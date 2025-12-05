import useSWR from 'swr';
import api from '@/lib/api';
import { useMemo } from 'react';

export interface Trainer {
  id?: string;
  username?: string;
  name?: string;
  profileImageUrl?: string;
}

const fetchCombinedTrainers = async () => {
  // fetch ausbilder and admins in parallel and merge
  const [ausbilderRes, adminsRes] = await Promise.allSettled([
    api.get<Trainer[]>('/api/user/ausbilder'),
    api.get<Trainer[]>('/api/user/admins'),
  ]);

  const ausbilder: Trainer[] =
    ausbilderRes.status === 'fulfilled'
      ? ausbilderRes.value.data || []
      : [];
  const admins: Trainer[] =
    adminsRes.status === 'fulfilled'
      ? adminsRes.value.data || []
      : [];

  // merge and dedupe by id or username
  const combined: Trainer[] = [];
  const seen = new Set<string>();
  const addIfNew = (t?: Trainer) => {
    if (!t) return;
    const key = t.id || t.username || JSON.stringify(t);
    if (seen.has(key)) return;
    seen.add(key);
    combined.push(t);
  };

  ausbilder.forEach(addIfNew);
  admins.forEach(addIfNew);

  return combined;
};

export default function useTrainers() {
  const { data, error, isLoading } = useSWR(
    '/api/user/trainers',
    fetchCombinedTrainers,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const trainers = useMemo(() => data || [], [data]);

  const trainersMap = useMemo(() => {
    const m: Record<string, string> = {};
    trainers.forEach((tr) => {
      const name = tr.name || '';
      if (tr.id) m[tr.id] = name;
      if (tr.username) m[tr.username] = name;
    });
    return m;
  }, [trainers]);

  return {
    trainers,
    trainersMap,
    isLoading,
    error,
  } as const;
}
