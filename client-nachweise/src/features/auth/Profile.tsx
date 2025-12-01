'use client';

import { useEffect, useState, forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import api from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/context/LanguageContext';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  ausbildungsjahr: z.union([z.string(), z.number()]).pipe(z.string()),
  telefonnummer: z.string().optional(),
  team: z.string().optional(),
  profileImageUrl: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface Trainer {
  id: string;
  name: string;
  email: string;
  profileImageUrl: string | null;
}

const TrainerSelectItem = forwardRef<
  HTMLDivElement,
  { trainer: Trainer }
>(({ trainer, ...props }, ref) => {
  return (
    <div
      ref={ref}
      {...props}
      className="flex items-center space-x-4 p-2"
    >
      <Avatar>
        <AvatarImage
          src={`${
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088'
          }${trainer.profileImageUrl}`}
          className="object-cover"
          alt={trainer.name}
        />
        <AvatarFallback>
          {trainer.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="font-semibold">{trainer.name}</div>
        <div className="text-sm text-gray-500">{trainer.email}</div>
      </div>
    </div>
  );
});
TrainerSelectItem.displayName = 'TrainerSelectItem';

export function Profile() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [user, setUser] = useState<ProfileFormValues | null>(null);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  const selectedTeam = watch('team');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/api/user/profile');
        const userData = {
          ...response.data,
          ausbildungsjahr: response.data.ausbildungsjahr?.toString(),
        };
        setUser(userData);
        reset(userData);
      } catch (error: unknown) {
        if (error instanceof Error) {
          showToast(error.message, 'error');
        } else {
          showToast(t('profile.updateError'), 'error');
        }
      }
    };
    const fetchTrainers = async () => {
      try {
        const response = await api.get('/api/user/ausbilder');
        setTrainers(response.data);
      } catch (error) {
        console.error('Failed to fetch trainers', error);
      }
    };
    fetchUser();
    fetchTrainers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await api.put('/api/user/profile', data);
      showToast(t('profile.updateSuccess'), 'success');
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast(error.message, 'error');
      } else {
        showToast(t('profile.updateError'), 'error');
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
      showToast(t('profile.selectFile'), 'error');
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
      showToast(t('profile.uploadSuccess'), 'success');
      setSelectedFile(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast(error.message, 'error');
      } else {
        showToast(t('profile.uploadError'), 'error');
      }
    }
  };

  const handleImageDelete = async () => {
    try {
      const response = await api.delete('/api/user/profile-image');
      setUser(response.data);
      showToast(t('profile.deleteSuccess'), 'success');
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast(error.message, 'error');
      } else {
        showToast(t('profile.deleteError'), 'error');
      }
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const selectedTrainer = trainers.find(
    (trainer) => trainer.name === selectedTeam
  );

  return (
    <Card className="w-full max-w-3xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-2xl text-dark dark:text-light">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">
          {t('profile.title')}
        </CardTitle>
        <CardDescription className="dark:text-gray-300">
          {t('profile.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-white/30">
              <AvatarImage
                src={`${
                  process.env.NEXT_PUBLIC_API_URL ||
                  'http://localhost:8088'
                }${user.profileImageUrl}`}
                alt="Profile"
                className="object-cover"
              />
              <AvatarFallback className="bg-gray-700 text-white text-4xl">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <Label
              htmlFor="profile-image"
              className="text-gray-300 cursor-pointer"
            >
              {t('profile.profileImage')}
            </Label>
            <Input
              id="profile-image"
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex space-x-2 pt-2">
              <Button
                onClick={() =>
                  document.getElementById('profile-image')?.click()
                }
                variant="outline"
                className="bg-transparent hover:bg-white/10 border-white/30"
              >
                {t('profile.changeImage')}
              </Button>
              <Button
                onClick={handleImageUpload}
                disabled={!selectedFile}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {t('profile.uploadImage')}
              </Button>
              {user.profileImageUrl && (
                <Button
                  onClick={handleImageDelete}
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600"
                >
                  {t('profile.deleteImage')}
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {t('profile.imageSizeHint')}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t('profile.name')}</Label>
              <Input
                id="name"
                {...register('name')}
                className="bg-white/5 border-white/20 focus:ring-white/50"
              />
              {errors.name && (
                <p className="text-sm text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('profile.email')}</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className="bg-white/5 border-white/20 focus:ring-white/50"
              />
              {errors.email && (
                <p className="text-sm text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ausbildungsjahr">
                {t('profile.ausbildungsjahr')}
              </Label>
              <Input
                id="ausbildungsjahr"
                type="text"
                {...register('ausbildungsjahr')}
                className="bg-white/5 border-white/20 focus:ring-white/50"
              />
              {errors.ausbildungsjahr && (
                <p className="text-sm text-red-400">
                  {errors.ausbildungsjahr.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefonnummer">
                {t('profile.telefonnummer')}
              </Label>
              <Input
                id="telefonnummer"
                {...register('telefonnummer')}
                className="bg-white/5 border-white/20 focus:ring-white/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team">{t('profile.trainer')}</Label>
              <Select
                onValueChange={(value) =>
                  setValue('team', value, { shouldDirty: true })
                }
                defaultValue={user.team}
              >
                <SelectTrigger className="bg-white/5 border-white/20 focus:ring-white/50 h-auto">
                  {selectedTrainer ? (
                    <TrainerSelectItem trainer={selectedTrainer} />
                  ) : (
                    <SelectValue
                      placeholder={t('profile.selectTrainer')}
                    />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {trainers.map((trainer) => (
                    <SelectItem key={trainer.id} value={trainer.name}>
                      <TrainerSelectItem trainer={trainer} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!isDirty}
              className="bg-green-500 hover:bg-green-600 px-8 py-3 text-lg font-semibold"
            >
              {t('profile.updateProfile')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
