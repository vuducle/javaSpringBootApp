'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Control,
  Controller,
  FieldValues,
  Path,
} from 'react-hook-form';
import { Ausbilder } from '../utils/nachweis-schema';

interface NachweisAusbilderSectionProps<T extends FieldValues> {
  ausbilderList: Ausbilder[];
  control: Control<T>; // Wir nutzen Control statt register/setValue/watch
  errors: any;
  t: (key: string) => string;
}

export default function NachweisAusbilderSection<
  T extends FieldValues
>({
  ausbilderList,
  control,
  errors,
  t,
}: NachweisAusbilderSectionProps<T>) {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088';

  return (
    <div className="space-y-2">
      <Label htmlFor="ausbilderId">
        {t('nachweis.Ausbilder/innen')}
      </Label>

      <Controller
        name={'ausbilderId' as Path<T>}
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger
              id="ausbilderId"
              className="w-full h-auto py-2"
            >
              {/* SelectValue ist zwingend erforderlich für die UI-Anzeige! */}
              <SelectValue
                placeholder={t('nachweis.ausbilderPlaceholder')}
              >
                {/* Hier definieren wir, wie der gewählte Wert im Button aussieht */}
                {field.value &&
                  (() => {
                    const selected = ausbilderList.find(
                      (a) => String(a.id) === String(field.value)
                    );
                    if (!selected) return null;
                    return (
                      <div className="flex items-center space-x-3 text-left">
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            src={`${apiUrl}${selected.profileImageUrl}`}
                          />
                          <AvatarFallback>
                            {selected.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm leading-none">
                            {selected.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selected.email}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {ausbilderList.map((ausbilder) => (
                <SelectItem
                  key={ausbilder.id}
                  value={String(ausbilder.id)}
                >
                  {/* Deine TrainerSelectItem Komponente */}
                  <div className="flex items-center space-x-4 p-1">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={`${apiUrl}${ausbilder.profileImageUrl}`}
                      />
                      <AvatarFallback>
                        {ausbilder.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <div className="font-semibold text-sm">
                        {ausbilder.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {ausbilder.email}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />

      {errors.ausbilderId && (
        <p className="text-sm text-red-500">
          {errors.ausbilderId.message}
        </p>
      )}
    </div>
  );
}
