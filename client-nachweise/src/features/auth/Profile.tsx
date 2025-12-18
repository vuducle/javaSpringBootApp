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
import {
  User,
  AtSign,
  Mail,
  Calendar,
  Phone,
  Users,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Save,
} from 'lucide-react';
import StatusPlaceholder from '@/components/ui/StatusPlaceholder';

type ProfileTranslationKeys = `profile.${
  | 'passwordTooShort'
  | 'passwordComplexity'
  | 'passwordsDontMatch'
  | 'oldPasswordRequired'
  | 'newPasswordRequired'}`;

const profileSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    ausbildungsjahr: z.string().min(1, 'Ausbildungsjahr is required'),
    telefonnummer: z.string().optional(),
    team: z.string().optional(),
    profileImageUrl: z.string().optional(),
    username: z.string().optional(),
    oldPassword: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.oldPassword && data.oldPassword.length > 0) {
        return data.password && data.password.length > 0;
      }
      return true;
    },
    {
      message: 'profile.newPasswordRequired',
      path: ['password'],
    }
  )
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password.length >= 8;
      }
      return true;
    },
    {
      message: 'profile.passwordTooShort',
      path: ['password'],
    }
  )
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
          data.password
        );
      }
      return true;
    },
    {
      message: 'profile.passwordComplexity',
      path: ['password'],
    }
  )
  .refine((data) => data.password === data.confirmPassword, {
    message: 'profile.passwordsDontMatch',
    path: ['confirmPassword'],
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
      const {
        oldPassword,
        password,
        name,
        email,
        username,
        ausbildungsjahr,
        telefonnummer,
        team,
      } = data;
      let hasChanges = false;

      // Handle password change
      if (
        oldPassword &&
        oldPassword.length > 0 &&
        password &&
        password.length > 0
      ) {
        await api.put('/api/user/change-password', {
          oldPassword,
          newPassword: password,
        });
        hasChanges = true;
        showToast(
          t('profile.passwordChangeSuccess') ||
            'Passwort erfolgreich geändert',
          'success'
        );
      }

      // Prepare profile update payload (all fields accepted by backend)
      const profileUpdatePayload = {
        name,
        email,
        username,
        ausbildungsjahr,
        telefonnummer,
        team,
      };

      // Check if profile fields have changed
      const profileChanged =
        name !== user?.name ||
        email !== user?.email ||
        username !== user?.username ||
        ausbildungsjahr !== user?.ausbildungsjahr ||
        telefonnummer !== user?.telefonnummer ||
        team !== user?.team;

      if (profileChanged) {
        const response = await api.put(
          '/api/user/profile',
          profileUpdatePayload
        );
        const updatedUserData = {
          ...response.data,
          ausbildungsjahr: response.data.ausbildungsjahr?.toString(),
        };
        setUser(updatedUserData);
        reset(updatedUserData);
        hasChanges = true;
        showToast(t('profile.updateSuccess'), 'success');
      }

      if (!hasChanges) {
        showToast(
          t('profile.noChanges') || 'Keine Änderungen vorgenommen',
          'info'
        );
      }
    } catch (error: unknown) {
      console.error('Profile update error:', error);
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
      const updatedUserData = {
        ...response.data,
        ausbildungsjahr: response.data.ausbildungsjahr?.toString(),
      };
      setUser(updatedUserData);
      reset(updatedUserData);
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
      const updatedUserData = {
        ...response.data,
        ausbildungsjahr: response.data.ausbildungsjahr?.toString(),
      };
      setUser(updatedUserData);
      reset(updatedUserData);
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
    return (
      <StatusPlaceholder
        loading
        loadingText={t('loading') ?? 'Lade...'}
      />
    );
  }

  const selectedTrainer = trainers.find(
    (trainer) => trainer.name === selectedTeam
  );

  return (
    <Card className="w-full max-w-3xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-2xl text-dark dark:text-light my-4 lg:my-8">
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
              className="text-gray-700 cursor-pointer"
            >
              <span>{t('profile.profileImage')}</span>
              <span>FEATURE: Bild ist pflicht!</span>
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
                <ImageIcon className="mr-2 h-4 w-4" aria-hidden />
                {t('profile.changeImage')}
              </Button>
              <Button
                onClick={handleImageUpload}
                disabled={!selectedFile}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <UploadCloud className="mr-2 h-4 w-4" aria-hidden />
                {t('profile.uploadImage')}
              </Button>
              {user.profileImageUrl && (
                <Button
                  onClick={handleImageDelete}
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" aria-hidden />
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
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4"
                  aria-hidden
                />
                <Input
                  id="name"
                  {...register('name')}
                  className="bg-white/5 border-white/20 focus:ring-white/50 pl-10"
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <AtSign
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4"
                  aria-hidden
                />
                <Input
                  id="username"
                  {...register('username')}
                  className="bg-white/5 border-white/20 focus:ring-white/50 pl-10"
                />
              </div>
              {errors.username && (
                <p className="text-sm text-red-400">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('profile.email')}</Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4"
                  aria-hidden
                />
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="bg-white/5 border-white/20 focus:ring-white/50 pl-10"
                />
              </div>
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
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4"
                  aria-hidden
                />
                <Input
                  id="ausbildungsjahr"
                  type="text"
                  {...register('ausbildungsjahr')}
                  className="bg-white/5 border-white/20 focus:ring-white/50 pl-10"
                />
              </div>
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
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4"
                  aria-hidden
                />
                <Input
                  id="telefonnummer"
                  {...register('telefonnummer')}
                  className="bg-white/5 border-white/20 focus:ring-white/50 pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="team">{t('profile.trainer')}</Label>
              <div className="relative">
                <Users
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4"
                  aria-hidden
                />
                <Select
                  onValueChange={(value) =>
                    setValue('team', value, { shouldDirty: true })
                  }
                  value={selectedTeam}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 focus:ring-white/50 h-auto pl-10">
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
                      <SelectItem
                        key={trainer.id}
                        value={trainer.name}
                      >
                        <TrainerSelectItem trainer={trainer} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">
                {t('profile.oldPassword')}
              </Label>
              <div className="relative">
                <Save
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4"
                  aria-hidden
                />
                <Input
                  id="oldPassword"
                  type="password"
                  {...register('oldPassword')}
                  className="bg-white/5 border-white/20 focus:ring-white/50 pl-10"
                />
              </div>
              {errors.oldPassword && (
                <p className="text-sm text-red-400">
                  {t(
                    errors.oldPassword
                      .message as ProfileTranslationKeys
                  )}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="password">
                {t('profile.newPassword')}
              </Label>
              <div className="relative">
                <Save
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4"
                  aria-hidden
                />
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  className="bg-white/5 border-white/20 focus:ring-white/50 pl-10"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-400">
                  {t(
                    errors.password.message as ProfileTranslationKeys
                  )}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t('profile.confirmPassword')}
              </Label>
              <div className="relative">
                <Save
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4"
                  aria-hidden
                />
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  className="bg-white/5 border-white/20 focus:ring-white/50 pl-10"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-400">
                  {t(
                    errors.confirmPassword
                      .message as ProfileTranslationKeys
                  )}
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!isDirty}
              className="bg-green-500 hover:bg-green-600 px-8 py-3 text-lg font-semibold"
            >
              <Save className="mr-2 h-4 w-4" aria-hidden />
              {t('profile.updateProfile')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
