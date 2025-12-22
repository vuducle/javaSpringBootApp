'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import api from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/context/LanguageContext';
import { useAppSelector } from '@/store';
import { selectUser } from '@/store/slices/userSlice';

// Komponenten
import NachweisBasicsSection from './components/NachweisBasicsSection';
import NachweisDateSection from './components/NachweisDateSection';
import NachweisAusbilderSection from './components/NachweisAusbilderSection';
import NachweisSummarySection from './components/NachweisSummarySection';
import NachweisSignatureSection from './components/NachweisSignatureSection';
import NachweisPDFPreview from './components/NachweisPDFPreview';
import NachweisDayFields from './components/NachweisDayFields';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Utils
import {
  pdfGenerationSchema,
  PdfGenerationFormValues,
  Ausbilder,
} from './utils/nachweis-schema';
import {
  DAY_MAPPINGS,
  BEREICH_TEMPLATES,
  TAETIGKEIT_TEMPLATES,
} from './utils/nachweis-templates';

export function CreateNachweisForm() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);

  const [ausbilderList, setAusbilderList] = useState<Ausbilder[]>([]);
  const [currentAusbilder, setCurrentAusbilder] =
    useState<Ausbilder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [createdNachweisId, setCreatedNachweisId] = useState<
    string | null
  >(null);
  const [nummerError, setNummerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = useForm<PdfGenerationFormValues>({
    resolver: zodResolver(pdfGenerationSchema),
    defaultValues: { name: user.name || '', nummer: 1 },
  });

  // Cleanup PDF URL
  useEffect(() => {
    return () => {
      if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  // Auto-Berechnung Gesamtstunden
  useEffect(() => {
    const calculateTotal = (timeValues: (string | undefined)[]) => {
      let total = 0;
      timeValues.forEach((time) => {
        if (time) {
          const hours = parseFloat(time);
          if (!isNaN(hours)) total += hours;
        }
      });
      return total > 0 ? total.toFixed(1) : '';
    };

    const dayTotals: string[] = [];
    let grandTotal = 0;

    DAY_MAPPINGS.forEach(({ prefix, maxSlots }) => {
      const times = Array.from({ length: maxSlots }, (_, i) =>
        watch(
          `${prefix}_Time_${i + 1}` as keyof PdfGenerationFormValues
        )
      );
      const dayTotal = calculateTotal(times);
      dayTotals.push(dayTotal);
      setValue(
        `${prefix}_Total` as keyof PdfGenerationFormValues,
        dayTotal
      );
      if (dayTotal) grandTotal += parseFloat(dayTotal);
    });

    setValue(
      'gesamtstunden',
      grandTotal > 0 ? grandTotal.toFixed(1) : ''
    );
  }, [
    watch('mo_Time_1'),
    watch('mo_Time_2'),
    watch('mo_Time_3'),
    watch('mo_Time_4'),
    watch('mo_Time_5'),
    watch('tu_Time_1'),
    watch('tu_Time_2'),
    watch('tu_Time_3'),
    watch('tu_Time_4'),
    watch('tu_Time_5'),
    watch('we_Time_1'),
    watch('we_Time_2'),
    watch('we_Time_3'),
    watch('we_Time_4'),
    watch('we_Time_5'),
    watch('th_Time_1'),
    watch('th_Time_2'),
    watch('th_Time_3'),
    watch('th_Time_4'),
    watch('th_Time_5'),
    watch('fr_Time_1'),
    watch('fr_Time_2'),
    watch('fr_Time_3'),
    watch('fr_Time_4'),
    watch('fr_Time_5'),
    watch('sa_Time_1'),
    watch('sa_Time_2'),
    watch('sa_Time_3'),
    watch('su_Time_1'),
    watch('su_Time_2'),
    watch('su_Time_3'),
    setValue,
  ]);

  // Ausbilder laden
  useEffect(() => {
    const fetchAusbilder = async () => {
      try {
        const response = await api.get('/api/user/ausbilder');
        setAusbilderList(response.data);
        return response.data;
      } catch (error: unknown) {
        console.error('Fehler beim Laden der Ausbilder:', error);
        if (error instanceof Error) showToast(error.message, 'error');
        return [];
      }
    };

    const fetchUserProfile = async (ausbilderList: Ausbilder[]) => {
      try {
        const response = await api.get('/api/user/profile');
        if (response.data) {
          setValue('name', response.data.name || user.name || '');
          if (response.data.ausbildungsjahr) {
            setValue(
              'ausbildungsjahr',
              String(response.data.ausbildungsjahr)
            );
          }

          if (response.data.trainer?.id) {
            const trainerId = String(response.data.trainer.id);
            const foundAusbilder = ausbilderList.find(
              (a) => a.id === trainerId
            );
            if (foundAusbilder) {
              setCurrentAusbilder(foundAusbilder);
              setValue('ausbilderId', foundAusbilder.id);
            }
          }
        }
      } catch (error) {
        console.error('Fehler beim Laden des Profils:', error);
        setValue('name', user.name || '');
      }
    };

    const fetchNextNummer = async () => {
      try {
        const response = await api.get(
          '/api/nachweise/my-nachweise/next-nummer'
        );
        if (response.data?.nextNummer) {
          setValue('nummer', response.data.nextNummer);
        }
      } catch (error) {
        console.error(
          'Fehler beim Abrufen der nächsten Nummer:',
          error
        );
      }
    };

    const init = async () => {
      const ausbilder = await fetchAusbilder();
      if (user.istEingeloggt) {
        await fetchUserProfile(ausbilder);
        await fetchNextNummer();
      }
    };

    init();
  }, [user.istEingeloggt, user.name, setValue]);

  // Form Submit
  const onSubmit = async (data: PdfGenerationFormValues) => {
    try {
      const res = await api.get(
        `/api/nachweise/my-nachweise/exists/by-nummer/${data.nummer}`
      );
      if (res.data?.exists) {
        const msg = `Sie haben bereits einen Nachweis mit der Nummer ${data.nummer}.`;
        setNummerError(msg);
        showToast(msg, 'error');
        return;
      }
    } catch (error) {
      console.error('Fehler beim Prüfen der Nummer:', error);
    }

    setIsLoading(true);
    try {
      const activities = [];
      for (const { prefix, day, maxSlots } of DAY_MAPPINGS) {
        for (let slot = 1; slot <= maxSlots; slot++) {
          const description =
            data[
              `${prefix}_${slot}` as keyof PdfGenerationFormValues
            ];
          const hours =
            data[
              `${prefix}_Time_${slot}` as keyof PdfGenerationFormValues
            ];
          const section =
            data[
              `${prefix}_Sec_${slot}` as keyof PdfGenerationFormValues
            ];

          if (description && hours && section) {
            activities.push({
              day,
              slot,
              description: String(description),
              hours: parseFloat(String(hours)) || 0,
              section: String(section),
            });
          }
        }
      }

      const response = await api.post('/api/nachweise', {
        datumStart: data.datumStart,
        datumEnde: data.datumEnde,
        nummer: Number(data.nummer),
        ausbildungsjahr: data.ausbildungsjahr,
        ausbilderId: data.ausbilderId,
        activities: activities.length > 0 ? activities : undefined,
        datumAzubi: data.datumAzubi || null,
        signaturAzubi: data.signaturAzubi || null,
        signaturAusbilder: data.signaturAusbilder || null,
        bemerkung: data.bemerkung || null,
      });

      showToast(t('nachweis.successMessage'), 'success');

      if (response.data?.id) {
        setCreatedNachweisId(response.data.id);
        const pdfResponse = await api.get(
          `/api/nachweise/${response.data.id}/pdf`,
          {
            responseType: 'blob',
          }
        );
        const blob = new Blob([pdfResponse.data], {
          type: 'application/pdf',
        });
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);

        try {
          const nextRes = await api.get(
            '/api/nachweise/my-nachweise/next-nummer'
          );
          if (nextRes.data?.nextNummer) {
            setValue('nummer', nextRes.data.nextNummer);
          }
        } catch {
          setValue('nummer', data.nummer + 1);
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast(error.message, 'error');
      } else {
        showToast(t('nachweis.errorMessage'), 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!createdNachweisId) return;
    try {
      const pdfResponse = await api.get(
        `/api/nachweise/${createdNachweisId}/pdf`,
        {
          responseType: 'blob',
        }
      );
      const blob = new Blob([pdfResponse.data], {
        type: 'application/pdf',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `nachweis_${createdNachweisId}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('PDF erfolgreich heruntergeladen', 'success');
    } catch {
      showToast('Fehler beim Herunterladen des PDFs', 'error');
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Formular */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t('nachweis.title')}</CardTitle>
            <CardDescription>
              {t('nachweis.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <NachweisBasicsSection
                register={register}
                errors={errors}
                currentAusbilder={currentAusbilder}
                t={t}
              />

              <NachweisDateSection
                register={register}
                errors={errors}
                t={t}
              />

              {/* Wochentage - Inline rendering */}
              {DAY_MAPPINGS.map(({ prefix, label, maxSlots }) => (
                <div
                  key={prefix}
                  className="space-y-4 p-4 border rounded-lg"
                >
                  <h3 className="font-semibold text-lg">{label}</h3>
                  {Array.from({ length: maxSlots }, (_, i) => {
                    const num = i + 1;
                    const bereichField =
                      `${prefix}_Sec_${num}` as keyof PdfGenerationFormValues;
                    const activityField =
                      `${prefix}_${num}` as keyof PdfGenerationFormValues;
                    const currentBereich = watch(
                      bereichField
                    ) as string;
                    const activityOptions =
                      currentBereich &&
                      TAETIGKEIT_TEMPLATES[currentBereich]
                        ? TAETIGKEIT_TEMPLATES[currentBereich]
                        : [];

                    return (
                      <div key={num} className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label htmlFor={`${prefix}_Sec_${num}`}>
                              {t('nachweis.section')} {num}
                            </Label>
                            <Input
                              id={`${prefix}_Sec_${num}`}
                              list={`${prefix}_Sec_${num}_list`}
                              placeholder="Bereich eingeben..."
                              {...register(bereichField)}
                            />
                            <datalist
                              id={`${prefix}_Sec_${num}_list`}
                            >
                              {BEREICH_TEMPLATES.map((bereich) => (
                                <option
                                  key={bereich}
                                  value={bereich}
                                />
                              ))}
                            </datalist>
                          </div>
                          <div>
                            <Label htmlFor={`${prefix}_${num}`}>
                              {t('nachweis.activity')} {num}
                            </Label>
                            <Input
                              id={`${prefix}_${num}`}
                              list={`${prefix}_${num}_list`}
                              placeholder="Tätigkeit eingeben..."
                              {...register(activityField)}
                            />
                            <datalist id={`${prefix}_${num}_list`}>
                              {activityOptions.map((taetigkeit) => (
                                <option
                                  key={taetigkeit}
                                  value={taetigkeit}
                                />
                              ))}
                            </datalist>
                          </div>
                          <div>
                            <Label htmlFor={`${prefix}_Time_${num}`}>
                              {t('nachweis.time')} {num}
                            </Label>
                            <Input
                              id={`${prefix}_Time_${num}`}
                              type="number"
                              step="0.5"
                              placeholder="0.0"
                              {...register(
                                `${prefix}_Time_${num}` as keyof PdfGenerationFormValues
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div>
                    <Label htmlFor={`${prefix}_Total`}>
                      {t('nachweis.total')}
                    </Label>
                    <Input
                      id={`${prefix}_Total`}
                      {...register(
                        `${prefix}_Total` as keyof PdfGenerationFormValues
                      )}
                      readOnly
                      className="bg-gray-100 font-semibold"
                    />
                  </div>
                </div>
              ))}

              <NachweisSummarySection register={register} t={t} />

              {/* Ausbilder & Unterschriften */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold text-lg">
                  Ausbilder & Unterschriften
                </h3>
                <NachweisAusbilderSection
                  ausbilderList={ausbilderList}
                  control={control}
                  errors={errors}
                  t={t}
                />
                <NachweisSignatureSection register={register} t={t} />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading
                  ? t('nachweis.submitting')
                  : t('nachweis.submitButton')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* PDF Vorschau */}
        <NachweisPDFPreview
          pdfUrl={pdfUrl}
          loading={isLoading}
          onDownload={handleDownloadPdf}
          onCreateNew={() => {
            reset();
            if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
            setCreatedNachweisId(null);
          }}
        />
      </div>
    </div>
  );
}
