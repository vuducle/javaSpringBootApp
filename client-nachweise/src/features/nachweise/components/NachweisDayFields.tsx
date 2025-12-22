'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Controller } from 'react-hook-form';
import { PdfGenerationFormValues } from '../utils/nachweis-schema';
import {
  BEREICH_TEMPLATES,
  TAETIGKEIT_TEMPLATES,
} from '../utils/nachweis-templates';

interface NachweisDayFieldsProps {
  dayPrefix: string;
  dayLabel: string;
  maxSlots: number;
  register: any;
  watch: any;
  control: any;
  t: (key: string) => string;
}

export default function NachweisDayFields({
  dayPrefix,
  dayLabel,
  maxSlots,
  register,
  watch,
  control,
  t,
}: NachweisDayFieldsProps) {
  // Watch time fields für Auto-Berechnung
  const timeFields = Array.from({ length: maxSlots }, (_, i) =>
    watch(
      `${dayPrefix}_Time_${i + 1}` as keyof PdfGenerationFormValues
    )
  );

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold text-lg">{dayLabel}</h3>
      {Array.from({ length: maxSlots }, (_, i) => {
        const num = i + 1;
        const currentBereich = watch(
          `${dayPrefix}_Sec_${num}` as keyof PdfGenerationFormValues
        ) as string;

        // Debug logging
        console.log(
          `[${dayPrefix}_${num}] Bereich raw:`,
          currentBereich,
          typeof currentBereich
        );
        console.log(
          `[${dayPrefix}_${num}] Bereich trimmed:`,
          currentBereich?.trim()
        );
        console.log(
          `[${dayPrefix}_${num}] Has key in templates?`,
          currentBereich in TAETIGKEIT_TEMPLATES
        );

        // Direct lookup in TAETIGKEIT_TEMPLATES
        const activityOptions =
          currentBereich && TAETIGKEIT_TEMPLATES[currentBereich]
            ? TAETIGKEIT_TEMPLATES[currentBereich]
            : [];

        console.log(
          `[${dayPrefix}_${num}] Activity options count:`,
          activityOptions.length
        );

        const activityField =
          `${dayPrefix}_${num}` as keyof PdfGenerationFormValues;
        return (
          <div key={num} className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor={`${dayPrefix}_Sec_${num}`}>
                  {t('nachweis.section')} {num}
                </Label>
                <Controller
                  name={
                    `${dayPrefix}_Sec_${num}` as keyof PdfGenerationFormValues
                  }
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Input
                      id={`${dayPrefix}_Sec_${num}`}
                      list={`${dayPrefix}_Sec_${num}_list`}
                      placeholder="Bereich eingeben..."
                      {...field}
                    />
                  )}
                />
                <datalist id={`${dayPrefix}_Sec_${num}_list`}>
                  {BEREICH_TEMPLATES.map((bereich) => (
                    <option key={bereich} value={bereich} />
                  ))}
                </datalist>
              </div>
              <div>
                <Label htmlFor={`${dayPrefix}_${num}`}>
                  {t('nachweis.activity')} {num}
                </Label>
                <Input
                  id={`${dayPrefix}_${num}`}
                  list={`${dayPrefix}_${num}_list`}
                  placeholder={t('nachweis.activity')}
                  key={`${dayPrefix}_${num}_${
                    currentBereich || 'none'
                  }`}
                  {...register(activityField)}
                />
                <datalist id={`${dayPrefix}_${num}_list`}>
                  {activityOptions.map((taetigkeit) => (
                    <option key={taetigkeit} value={taetigkeit} />
                  ))}
                </datalist>
              </div>
              <div>
                <Label htmlFor={`${dayPrefix}_Time_${num}`}>
                  {t('nachweis.time')} {num}
                </Label>
                <Input
                  id={`${dayPrefix}_Time_${num}`}
                  type="number"
                  step="0.5"
                  placeholder="0.0"
                  {...register(
                    `${dayPrefix}_Time_${num}` as keyof PdfGenerationFormValues
                  )}
                />
              </div>
            </div>
          </div>
        );
      })}
      <div>
        <Label htmlFor={`${dayPrefix}_Total`}>
          {t('nachweis.total')}
        </Label>
        <Input
          id={`${dayPrefix}_Total`}
          {...register(
            `${dayPrefix}_Total` as keyof PdfGenerationFormValues
          )}
          readOnly
          className="bg-gray-100 font-semibold"
        />
      </div>
    </div>
  );
}
