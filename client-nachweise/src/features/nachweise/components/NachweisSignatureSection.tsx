'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UseFormRegister, FieldValues, Path } from 'react-hook-form';

interface NachweisSignatureSectionProps<T extends FieldValues> {
  register: UseFormRegister<T>;
  t: (key: string) => string;
}

export default function NachweisSignatureSection<
  T extends FieldValues
>({ register, t }: NachweisSignatureSectionProps<T>) {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold text-lg">Unterschriften</h3>

      <div className="space-y-2">
        <p className="text-red-500">
          Bemerkung/Remark funktioniert nicht! Aber die Generierung
          funktioniert.
        </p>
        <Label htmlFor="datumAzubi">{t('nachweis.dateAzubi')}</Label>
        <Input
          id="datumAzubi"
          type="date"
          {...register('datumAzubi' as Path<T>)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signaturAzubi">
          {t('nachweis.sigAzubi')}
        </Label>
        <Input
          id="signaturAzubi"
          {...register('signaturAzubi' as Path<T>)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signaturAusbilder">
          {t('nachweis.sigAusbilder')}
        </Label>
        <Input
          id="signaturAusbilder"
          {...register('signaturAusbilder' as Path<T>)}
        />
      </div>
    </div>
  );
}
