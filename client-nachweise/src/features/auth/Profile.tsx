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
import Image from 'next/image';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  ausbildungsjahr: z.number().int().min(1).max(4),
  telefonnummer: z.string().optional(),
  team: z.string().optional(),
  profileImageUrl: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function Profile() {
  const { showToast } = useToast();
  const [user, setUser] = useState<ProfileFormValues | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
      } catch (error: unknown) {
        if (error instanceof Error) {
          showToast(error.message, 'error');
        } else {
          showToast('An unexpected error occurred', 'error');
        }
      }
    };
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await api.put('/api/user/profile', data);
      showToast(
        'Your profile has been successfully updated.',
        'success'
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast(error.message, 'error');
      } else {
        showToast('An unexpected error occurred', 'error');
      }
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      showToast('Please select a file to upload.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await api.put(
        '/api/user/profile-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setUser(response.data);
      showToast('Profile image uploaded successfully.', 'success');
      setSelectedFile(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast(error.message, 'error');
      } else {
        showToast('An unexpected error occurred', 'error');
      }
    }
  };

  const handleImageDelete = async () => {
    try {
      const response = await api.delete('/api/user/profile-image');
      setUser(response.data);
      showToast('Profile image deleted successfully.', 'success');
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast(error.message, 'error');
      } else {
        showToast('An unexpected error occurred', 'error');
      }
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
        <div className="flex items-center space-x-4 mb-4">
          {user.profileImageUrl && (
            <Image
              src={`${
                process.env.NEXT_PUBLIC_API_URL ||
                'http://localhost:8088'
              }${user.profileImageUrl}`}
              alt="Profile"
              className="w-20 h-20 rounded-full"
              width={80}
              height={80}
            />
          )}
          <div className="space-y-2">
            <Label htmlFor="profile-image">Profile Image</Label>
            <Input
              id="profile-image"
              type="file"
              onChange={handleFileChange}
            />
            <div className="flex space-x-2">
              <Button
                onClick={handleImageUpload}
                disabled={!selectedFile}
              >
                Upload Image
              </Button>
              {user.profileImageUrl && (
                <Button
                  onClick={handleImageDelete}
                  variant="destructive"
                >
                  Delete Image
                </Button>
              )}
            </div>
          </div>
        </div>
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
