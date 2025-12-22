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
} from '@/components/ui/card';
import api from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/context/LanguageContext';
import { useAppSelector } from '@/store';
import { selectUser } from '@/store/slices/userSlice';
import { useRouter } from 'next/navigation';

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
import NachweisBasicsSection from './components/NachweisBasicsSection';
import NachweisAusbilderSection from './components/NachweisAusbilderSection';
import NachweisDateSection from './components/NachweisDateSection';
import NachweisSummarySection from './components/NachweisSummarySection';
import NachweisSignatureSection from './components/NachweisSignatureSection';
import NachweisPDFPreview from './components/NachweisPDFPreview';
import NachweisDayFields from './components/NachweisDayFields';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditNachweisFormProps {
  nachweisId: string;
}

export default function EditNachweisForm({
  nachweisId,
}: EditNachweisFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { t, language } = useTranslation();
  const user = useAppSelector(selectUser);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
    control,
  } = useForm<PdfGenerationFormValues>({
    resolver: zodResolver(pdfGenerationSchema),
  });

  const [ausbilderList, setAusbilderList] = useState<Ausbilder[]>([]);
  const [currentAusbilder, setCurrentAusbilder] =
    useState<Ausbilder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch Nachweis data and populate form
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Fetch Ausbilder list
        const ausbilderRes = await api.get('/api/user/ausbilder');
        setAusbilderList(ausbilderRes.data);

        // Fetch specific Nachweis
        const nachweisRes = await api.get(
          `/api/nachweise/${nachweisId}`
        );
        const nachweisData = nachweisRes.data;
        console.log('Fetched Nachweis data:', nachweisData);
        console.log('Activities:', nachweisData.activities);

        // Access control - only owner or assigned trainer can edit
        const isOwner = nachweisData.azubi?.id === user.id;
        const isTrainer = nachweisData.ausbilder?.id === user.id;
        if (!isOwner && !isTrainer) {
          showToast(
            language === 'de'
              ? 'Sie haben keine Berechtigung, diesen Nachweis zu bearbeiten'
              : 'You do not have permission to edit this Nachweis',
            'error'
          );
          router.push('/');
          return;
        }

        // Set form values from fetched data
        const formData = {
          name: nachweisData.azubi?.name || user.name || '',
          datumStart: nachweisData.datumStart || '',
          datumEnde: nachweisData.datumEnde || '',
          nummer: nachweisData.nummer || 1,
          ausbildungsjahr: nachweisData.ausbildungsjahr || '',
          ausbilderId: String(nachweisData.ausbilder?.id || ''),
          gesamtstunden: nachweisData.gesamtstunden?.toString() || '',
          bemerkung: nachweisData.bemerkung || '',
          datumAzubi: nachweisData.datumAzubi || '',
          signaturAzubi: nachweisData.signaturAzubi || '',
          signaturAusbilder: nachweisData.signaturAusbilder || '',
        } as any;

        console.log('FormData before reset:', formData);
        console.log('Name value:', formData.name);
        console.log('Name type:', typeof formData.name);

        // Populate day fields from activities
        DAY_MAPPINGS.forEach(({ prefix, day, maxSlots }) => {
          for (let i = 0; i < maxSlots; i++) {
            const dayData = nachweisData.activities?.find(
              (e: any) => e.day === day && e.slot === i + 1
            );
            console.log(
              `Looking for day=${day}, slot=${i + 1}:`,
              dayData
            );
            if (dayData) {
              formData[`${prefix}_Sec_${i + 1}`] =
                dayData.section || '';
              formData[`${prefix}_${i + 1}`] =
                dayData.description || '';
              formData[`${prefix}_Time_${i + 1}`] =
                dayData.hours?.toString() || '';
            }
          }
        });

        reset(formData);

        // Set current Ausbilder - comes directly from nachweisData
        if (nachweisData.ausbilder) {
          setCurrentAusbilder(nachweisData.ausbilder);
        }
      } catch (error) {
        console.error('Error loading Nachweis:', error);
        showToast('Fehler beim Laden des Nachweises', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [nachweisId]);

  // Auto-calculate totals when time fields change
  useEffect(() => {
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

      if (dayTotal) {
        grandTotal += parseFloat(dayTotal);
      }
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

  const calculateTotal = (times: any[]): string => {
    const total = times
      .filter((t) => t && String(t).trim())
      .reduce((sum, timeValue) => {
        const hours = parseFloat(String(timeValue)) || 0;
        return sum + hours;
      }, 0);

    return total > 0 ? total.toFixed(1) : '';
  };

  const onSubmit = async (data: PdfGenerationFormValues) => {
    console.log('Submit triggered, form data:', data);
    console.log('Form errors:', errors);

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

      console.log('Activities to send:', activities);

      const updatePayload = {
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
      };

      console.log('Update payload:', updatePayload);

      // Update Nachweis
      await api.put(`/api/nachweise/${nachweisId}`, updatePayload);

      showToast(
        language === 'de'
          ? 'Nachweis erfolgreich aktualisiert'
          : 'Nachweis updated successfully',
        'success'
      );

      // Generate PDF
      const pdfRes = await api.get(
        `/api/nachweise/${nachweisId}/pdf`,
        {
          responseType: 'blob',
        }
      );

      const blob = new Blob([pdfRes.data], {
        type: 'application/pdf',
      });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setShowPreview(true);
    } catch (error: any) {
      console.error('Error updating Nachweis:', error);
      console.error('Error response:', error.response?.data);
      const message =
        error.response?.data?.message ||
        (language === 'de'
          ? 'Fehler beim Aktualisieren des Nachweises'
          : 'Error updating Nachweis');
      showToast(message, 'error');
    }
  };

  const onError = (errors: any) => {
    console.log('Form validation errors:', errors);

    // Find first error and show it
    const firstErrorKey = Object.keys(errors)[0];
    const firstError = errors[firstErrorKey];

    const errorMessage =
      firstError?.message ||
      'Bitte füllen Sie alle Pflichtfelder aus';

    console.log('First error field:', firstErrorKey);
    console.log('Error message:', errorMessage);

    showToast(errorMessage, 'error');
  };

  const handleDownloadPdf = () => {
    if (!pdfUrl) return;

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Nachweis_${watch('nummer')}.pdf`;
    link.click();
  };

  const handleCreateNew = () => {
    router.push('/erstellen');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          {language === 'de' ? 'Wird geladen...' : 'Loading...'}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {showPreview && pdfUrl ? (
        <NachweisPDFPreview
          pdfUrl={pdfUrl}
          loading={false}
          onDownload={handleDownloadPdf}
          onCreateNew={handleCreateNew}
        />
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit, onError)}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'de'
                  ? 'Nachweis bearbeiten'
                  : 'Edit Nachweis'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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

              <NachweisAusbilderSection
                ausbilderList={ausbilderList}
                control={control}
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

              <NachweisSignatureSection register={register} t={t} />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting
                  ? language === 'de'
                    ? 'Wird gespeichert...'
                    : 'Saving...'
                  : language === 'de'
                  ? 'Nachweis aktualisieren & PDF generieren'
                  : 'Update Nachweis & Generate PDF'}
              </Button>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
