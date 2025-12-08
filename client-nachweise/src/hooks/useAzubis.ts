import useSWR from 'swr';
import api from '@/lib/api';
import { useMemo } from 'react';

export interface Azubi {
  id?: string;
  username?: string;
  name?: string;
  profileImageUrl?: string;
  roles?: string[];
}

interface BenutzerResponse {
  content: Azubi[];
  totalPages: number;
}

const fetchAzubis = async () => {
  const response = await api.get<BenutzerResponse>('/api/user/users', {
    params: { 
      rolle: 'ROLE_USER',
      size: 1000 // Get all users at once for the dropdown
    },
  });
  const result = response.data?.content;
  // Ensure we always return an array and filter for users with ROLE_USER
  if (Array.isArray(result)) {
    return result.filter(user => 
      user.roles?.includes('ROLE_USER') || user.roles?.includes('USER')
    );
  }
  return [];
};

export default function useAzubis() {
  const { data, error, isLoading } = useSWR(
    '/api/user/users-azubis',
    fetchAzubis,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const azubis = useMemo(() => {
    // Ensure azubis is always an array
    return Array.isArray(data) ? data : [];
  }, [data]);

  return {
    azubis,
    isLoading,
    error,
  } as const;
}
