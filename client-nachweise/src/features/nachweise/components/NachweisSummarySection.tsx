'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UseFormRegister, FieldValues, Path } from 'react-hook-form';

interface NachweisSummarySectionProps<T extends FieldValues> {
  register: UseFormRegister<T>;
  t: (key: string) => string;
}

export default function NachweisSummarySection<
  T extends FieldValues
>({ register, t }: NachweisSummarySectionProps<T>) {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold text-lg">Zusammenfassung</h3>
      <div className="space-y-2">
        <Label htmlFor="gesamtstunden">
          {t('nachweis.gesamtstunden')}
        </Label>
        <Input
          id="gesamtstunden"
          {...register('gesamtstunden' as Path<T>)}
          readOnly
          className="bg-gray-100"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bemerkung">{t('nachweis.remark')}</Label>
        <Input id="bemerkung" {...register('bemerkung' as Path<T>)} />
      </div>
    </div>
  );
}
