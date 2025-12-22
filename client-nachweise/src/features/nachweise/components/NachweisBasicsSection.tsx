'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { UseFormRegister, FieldValues, Path } from 'react-hook-form';

interface NachweisBasicsSectionProps<T extends FieldValues> {
  register: UseFormRegister<T>;
  errors: any;
  currentAusbilder: {
    name: string;
    email: string;
    profileImageUrl?: string | null;
  } | null;
  t: (key: string) => string;
}

export default function NachweisBasicsSection<T extends FieldValues>({
  register,
  errors,
  currentAusbilder,
  t,
}: NachweisBasicsSectionProps<T>) {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold text-lg">Basis-Informationen</h3>
      <div className="space-y-2">
        <Label htmlFor="name">{t('nachweis.name')}</Label>
        <Input id="name" {...register('name' as Path<T>)} />
        {errors.name && (
          <p className="text-sm text-red-500">
            {errors.name.message}
          </p>
        )}
      </div>
      {currentAusbilder && (
        <div className="space-y-2">
          <Label>Dein aktueller Ausbilder</Label>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src={
                      currentAusbilder.profileImageUrl
                        ? `${
                            process.env.NEXT_PUBLIC_API_URL ||
                            'http://localhost:8088'
                          }${currentAusbilder.profileImageUrl}`
                        : ''
                    }
                    alt={currentAusbilder.name}
                  />
                  <AvatarFallback>
                    {currentAusbilder.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">
                    {currentAusbilder.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {currentAusbilder.email}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
