'use client';

import { useTranslation } from '@/context/LanguageContext';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Image from 'next/image';

interface Profile {
  name: string;
  email: string;
  ausbildungsjahr: number;
  telefonnummer: string;
  team: string;
  profileImageUrl: string;
}

export default function ProfileCard() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/user/profile');
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>Error loading profile.</div>;
  }

  return (
    <div className="bg-white/60 dark:bg-zinc-800/50 backdrop-blur-md border border-white/20 dark:border-zinc-700/40 shadow-lg rounded-2xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-primary">
        👤 {t('profile.title')}
      </h2>
      <div className="flex items-center flex-col sm:flex-row gap-4">
        {profile.profileImageUrl && (
          <Image
            src={`${
              process.env.NEXT_PUBLIC_API_URL ||
              'http://localhost:8088'
            }${profile.profileImageUrl}`}
            alt="Profile"
            className="w-24 h-24 rounded-full mr-0 object-cover mb-4 ring-1 ring-white/30 shadow-md"
            width={96}
            height={96}
          />
        )}
        <div className="text-sm">
          <p className="mb-1">
            <strong>{t('profile.name')}:</strong> {profile.name}
          </p>
          <p className="mb-1">
            <strong>{t('profile.email')}:</strong> {profile.email}
          </p>
          <p className="mb-1">
            <strong>{t('profile.ausbildungsjahr')}:</strong>{' '}
            {profile.ausbildungsjahr}
          </p>
          <p className="mb-1">
            <strong>{t('profile.telefonnummer')}:</strong>{' '}
            {profile.telefonnummer}
          </p>
          <p className="mb-1">
            <strong>{t('profile.team')}:</strong> {profile.team}
          </p>
        </div>
      </div>
    </div>
  );
}
