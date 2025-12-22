'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UseFormRegister, FieldValues, Path } from 'react-hook-form';

interface NachweisDateSectionProps<T extends FieldValues> {
  register: UseFormRegister<T>;
  errors: any;
  t: (key: string) => string;
}

export default function NachweisDateSection<T extends FieldValues>({
  register,
  errors,
  t,
}: NachweisDateSectionProps<T>) {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold text-lg">Zeitraum & Nummer</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="datumStart">
            {t('nachweis.datumStart')}
          </Label>
          <Input
            id="datumStart"
            type="date"
            {...register('datumStart' as Path<T>)}
          />
          {errors.datumStart && (
            <p className="text-sm text-red-500">
              {errors.datumStart.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="datumEnde">{t('nachweis.datumEnde')}</Label>
          <Input
            id="datumEnde"
            type="date"
            {...register('datumEnde' as Path<T>)}
          />
          {errors.datumEnde && (
            <p className="text-sm text-red-500">
              {errors.datumEnde.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nummer">{t('nachweis.nr')}</Label>
        <Input
          id="nummer"
          type="number"
          {...register('nummer' as Path<T>, { valueAsNumber: true })}
        />
        {errors.nummer && (
          <p className="text-sm text-red-500">
            {errors.nummer.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="ausbildungsjahr">
          {t('nachweis.ausbildungsjahr')}
        </Label>
        <Input
          id="ausbildungsjahr"
          placeholder={t('nachweis.ausbildungsjahrPlaceholder')}
          {...register('ausbildungsjahr' as Path<T>)}
        />
        {errors.ausbildungsjahr && (
          <p className="text-sm text-red-500">
            {errors.ausbildungsjahr.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="listEvery">{t('nachweis.listEvery')}</Label>
        <Input id="listEvery" {...register('listEvery' as Path<T>)} />
      </div>
    </div>
  );
}
