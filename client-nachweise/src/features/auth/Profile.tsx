'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import api from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  ausbildungsjahr: z.number().int().min(1).max(4),
  telefonnummer: z.string().optional(),
  team: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function Profile() {
  const { showToast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<ProfileFormValues | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/api/user/profile');
        setUser(response.data);
        reset(response.data);
      } catch (error) {
        showToast('Error fetching profile', 'error');
      }
    };
    fetchUser();
  }, []);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await api.put('/api/user/profile', data);
      showToast(
        'Your profile has been successfully updated.',
        'success'
      );
    } catch (error) {
      showToast('Could not update your profile.', 'error');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-red-500">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && (
              <p className="text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ausbildungsjahr">Ausbildungsjahr</Label>
            <Input
              id="ausbildungsjahr"
              type="number"
              {...register('ausbildungsjahr', {
                valueAsNumber: true,
              })}
            />
            {errors.ausbildungsjahr && (
              <p className="text-sm text-red-500">
                {errors.ausbildungsjahr.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefonnummer">Telefonnummer</Label>
            <Input
              id="telefonnummer"
              {...register('telefonnummer')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team">Team</Label>
            <Input id="team" {...register('team')} />
          </div>
          <Button type="submit" disabled={!isDirty}>
            Update Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
