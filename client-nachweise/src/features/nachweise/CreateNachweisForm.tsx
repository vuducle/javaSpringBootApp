'use client';

import { useState, useEffect, forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { useAppSelector } from '@/store';
import { selectUser } from '@/store/slices/userSlice';
// Image import removed (not used)

// Templates für Bereiche und Tätigkeiten
const BEREICH_TEMPLATES = [
  'Entwickeln',
  'Designen',
  'Meeting',
  'Schule',
  'Sonstiges',
] as const;

const TAETIGKEIT_TEMPLATES: Record<string, string[]> = {
  Entwickeln: [
    'Frontend-Entwicklung mit React/Next.js',
    'Backend-Entwicklung mit Java Spring Boot',
    'Datenbankdesign und SQL-Abfragen',
    'API-Integration und Testing',
    'Code-Review und Refactoring',
  ],
  Designen: [
    'UI/UX-Konzepterstellung',
    'Wireframing und Prototyping',
    'Design System Entwicklung',
    'User Research und Testing',
    'Responsive Design Implementierung',
  ],
  Meeting: [
    'Daily Standup mit Team',
    'Sprint Planning Meeting',
    'Retrospektive und Feedback',
    'Kundenpräsentation',
    'Technisches Review Meeting',
  ],
  Schule: [
    'Berufsschulunterricht',
    'Prüfungsvorbereitung',
    'Projektarbeit für Schule',
    'Fachtheorie Softwareentwicklung',
    'Selbststudium und Recherche',
  ],
  Sonstiges: [
    'Allgemeine Verwaltungstätigkeiten',
    'Teamkoordination',
    'Fortbildung und Schulungen',
    'Krank',
    'Urlaub',
  ],
};

const pdfGenerationSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  datumStart: z.string().min(1, 'Startdatum ist erforderlich'),
  datumEnde: z.string().min(1, 'Enddatum ist erforderlich'),
  nummer: z.number().int().min(1, 'Nummer muss mindestens 1 sein'),
  ausbildungsjahr: z
    .string()
    .min(1, 'Ausbildungsjahr ist erforderlich'),
  ausbilderId: z.string().uuid('Bitte wählen Sie einen Ausbilder'),
  listEvery: z.string().optional(),
  // Montag
  mo_Sec_1: z.string().optional(),
  mo_1: z.string().optional(),
  mo_Time_1: z.string().optional(),
  mo_Sec_2: z.string().optional(),
  mo_Time_2: z.string().optional(),
  mo_2: z.string().optional(),
  mo_Sec_3: z.string().optional(),
  mo_Time_3: z.string().optional(),
  mo_3: z.string().optional(),
  mo_Sec_4: z.string().optional(),
  mo_Time_4: z.string().optional(),
  mo_4: z.string().optional(),
  mo_Sec_5: z.string().optional(),
  mo_Total: z.string().optional(),
  mo_Time_5: z.string().optional(),
  mo_5: z.string().optional(),
  // Dienstag
  tu_Sec_1: z.string().optional(),
  tu_1: z.string().optional(),
  tu_Time_1: z.string().optional(),
  tu_Sec_2: z.string().optional(),
  tu_2: z.string().optional(),
  tu_Time_2: z.string().optional(),
  tu_Sec_3: z.string().optional(),
  tu_3: z.string().optional(),
  tu_Time_3: z.string().optional(),
  tu_Sec_4: z.string().optional(),
  tu_4: z.string().optional(),
  tu_Time_4: z.string().optional(),
  tu_Sec_5: z.string().optional(),
  tu_Total: z.string().optional(),
  tu_5: z.string().optional(),
  tu_Time_5: z.string().optional(),
  // Mittwoch
  we_Sec_1: z.string().optional(),
  we_1: z.string().optional(),
  we_Time_1: z.string().optional(),
  we_Sec_2: z.string().optional(),
  we_2: z.string().optional(),
  we_Time_2: z.string().optional(),
  we_3: z.string().optional(),
  we_Time_3: z.string().optional(),
  we_Sec_3: z.string().optional(),
  we_Sec_4: z.string().optional(),
  we_4: z.string().optional(),
  we_Time_4: z.string().optional(),
  we_Sec_5: z.string().optional(),
  we_Total: z.string().optional(),
  we_5: z.string().optional(),
  we_Time_5: z.string().optional(),
  // Donnerstag
  th_Sec_1: z.string().optional(),
  th_Time_1: z.string().optional(),
  th_1: z.string().optional(),
  th_Sec_2: z.string().optional(),
  th_Time_2: z.string().optional(),
  th_2: z.string().optional(),
  th_3: z.string().optional(),
  th_Sec_3: z.string().optional(),
  th_Time_3: z.string().optional(),
  th_4: z.string().optional(),
  th_Time_4: z.string().optional(),
  th_Sec_4: z.string().optional(),
  th_Sec_5: z.string().optional(),
  th_5: z.string().optional(),
  th_Total: z.string().optional(),
  th_Time_5: z.string().optional(),
  // Freitag
  fr_1: z.string().optional(),
  fr_Sec_1: z.string().optional(),
  fr_Time_1: z.string().optional(),
  fr_2: z.string().optional(),
  fr_Sec_2: z.string().optional(),
  fr_Time_2: z.string().optional(),
  fr_3: z.string().optional(),
  fr_Sec_3: z.string().optional(),
  fr_Time_3: z.string().optional(),
  fr_4: z.string().optional(),
  fr_Time_4: z.string().optional(),
  fr_Sec_4: z.string().optional(),
  fr_Total: z.string().optional(),
  fr_5: z.string().optional(),
  fr_Sec_5: z.string().optional(),
  fr_Time_5: z.string().optional(),
  // Samstag
  sa_Sec_1: z.string().optional(),
  sa_1: z.string().optional(),
  sa_Time_1: z.string().optional(),
  sa_2: z.string().optional(),
  sa_Sec_2: z.string().optional(),
  sa_Time_2: z.string().optional(),
  sa_3: z.string().optional(),
  sa_Time_3: z.string().optional(),
  sa_Sec_3: z.string().optional(),
  sa_Total: z.string().optional(),
  // Sonntag
  su_1: z.string().optional(),
  su_Sec_1: z.string().optional(),
  su_Time_1: z.string().optional(),
  su_2: z.string().optional(),
  su_Sec_2: z.string().optional(),
  su_Time_2: z.string().optional(),
  su_Sec_3: z.string().optional(),
  su_3: z.string().optional(),
  su_Time_3: z.string().optional(),
  su_Total: z.string().optional(),
  gesamtstunden: z.string().optional(),
  remark: z.string().optional(),
  date_Azubi: z.string().optional(),
  sig_Azubi: z.string().optional(),
  sig_Ausbilder: z.string().optional(),
});

type PdfGenerationFormValues = z.infer<typeof pdfGenerationSchema>;

interface Ausbilder {
  id: string;
  name: string;
  email: string;
  profileImageUrl: string | null;
}

const TrainerSelectItem = forwardRef<
  HTMLDivElement,
  { trainer: Ausbilder }
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

export function CreateNachweisForm() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);
  const [ausbilderList, setAusbilderList] = useState<Ausbilder[]>([]);
  const [currentAusbilder, setCurrentAusbilder] =
    useState<Ausbilder | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [createdNachweisId, setCreatedNachweisId] = useState<
    string | null
  >(null);
  const [nummerError, setNummerError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PdfGenerationFormValues>({
    resolver: zodResolver(pdfGenerationSchema),
    defaultValues: {
      name: user.name || '',
      nummer: 1,
    },
  });

  // Prüft, ob der Benutzer bereits einen Nachweis mit dieser Nummer hat
  const checkNummerExists = async (nummer: number) => {
    if (!nummer) {
      console.log('checkNummerExists: Nummer ist leer oder 0');
      return;
    }

    console.log(
      'checkNummerExists wird aufgerufen mit Nummer:',
      nummer
    );

    try {
      const res = await api.get(
        `/api/nachweise/my-nachweise/exists/by-nummer/${nummer}`
      );
      console.log('API Response:', res.data);
      const data = res.data;
      if (data && data.exists) {
        const msg = `Sie haben bereits einen Nachweis mit der Nummer ${nummer}.`;
        console.log('Setze Fehler und zeige Toast:', msg);
        setNummerError(msg);
        showToast(msg, 'error');
      } else {
        console.log('Nummer ist verfügbar, lösche Fehler');
        setNummerError('');
        showToast('Nummer ist verfügbar!', 'success');
      }
    } catch (error: unknown) {
      console.error(
        'Fehler bei der Prüfung der Nachweisnummer:',
        error
      );
      const msg = 'Konnte Nummer nicht validieren.';
      console.log('Zeige Fehler-Toast:', msg);
      setNummerError(msg);
      showToast(msg, 'error');
    }
  };

  // Cleanup PDF URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Watch all time fields for auto-calculation
  const mo_Time_1 = watch('mo_Time_1');
  const mo_Time_2 = watch('mo_Time_2');
  const mo_Time_3 = watch('mo_Time_3');
  const mo_Time_4 = watch('mo_Time_4');
  const mo_Time_5 = watch('mo_Time_5');
  const tu_Time_1 = watch('tu_Time_1');
  const tu_Time_2 = watch('tu_Time_2');
  const tu_Time_3 = watch('tu_Time_3');
  const tu_Time_4 = watch('tu_Time_4');
  const tu_Time_5 = watch('tu_Time_5');
  const we_Time_1 = watch('we_Time_1');
  const we_Time_2 = watch('we_Time_2');
  const we_Time_3 = watch('we_Time_3');
  const we_Time_4 = watch('we_Time_4');
  const we_Time_5 = watch('we_Time_5');
  const th_Time_1 = watch('th_Time_1');
  const th_Time_2 = watch('th_Time_2');
  const th_Time_3 = watch('th_Time_3');
  const th_Time_4 = watch('th_Time_4');
  const th_Time_5 = watch('th_Time_5');
  const fr_Time_1 = watch('fr_Time_1');
  const fr_Time_2 = watch('fr_Time_2');
  const fr_Time_3 = watch('fr_Time_3');
  const fr_Time_4 = watch('fr_Time_4');
  const fr_Time_5 = watch('fr_Time_5');
  const sa_Time_1 = watch('sa_Time_1');
  const sa_Time_2 = watch('sa_Time_2');
  const sa_Time_3 = watch('sa_Time_3');
  const su_Time_1 = watch('su_Time_1');
  const su_Time_2 = watch('su_Time_2');
  const su_Time_3 = watch('su_Time_3');

  // Auto-calculate totals for each day
  useEffect(() => {
    const calculateDayTotal = (
      timeValues: (string | undefined)[]
    ) => {
      let total = 0;
      for (const timeValue of timeValues) {
        if (timeValue) {
          const hours = parseFloat(String(timeValue));
          if (!isNaN(hours)) {
            total += hours;
          }
        }
      }
      return total > 0 ? total.toFixed(1) : '';
    };

    // Calculate totals for each day
    const moTotal = calculateDayTotal([
      mo_Time_1,
      mo_Time_2,
      mo_Time_3,
      mo_Time_4,
      mo_Time_5,
    ]);
    const tuTotal = calculateDayTotal([
      tu_Time_1,
      tu_Time_2,
      tu_Time_3,
      tu_Time_4,
      tu_Time_5,
    ]);
    const weTotal = calculateDayTotal([
      we_Time_1,
      we_Time_2,
      we_Time_3,
      we_Time_4,
      we_Time_5,
    ]);
    const thTotal = calculateDayTotal([
      th_Time_1,
      th_Time_2,
      th_Time_3,
      th_Time_4,
      th_Time_5,
    ]);
    const frTotal = calculateDayTotal([
      fr_Time_1,
      fr_Time_2,
      fr_Time_3,
      fr_Time_4,
      fr_Time_5,
    ]);
    const saTotal = calculateDayTotal([
      sa_Time_1,
      sa_Time_2,
      sa_Time_3,
    ]);
    const suTotal = calculateDayTotal([
      su_Time_1,
      su_Time_2,
      su_Time_3,
    ]);

    setValue('mo_Total', moTotal);
    setValue('tu_Total', tuTotal);
    setValue('we_Total', weTotal);
    setValue('th_Total', thTotal);
    setValue('fr_Total', frTotal);
    setValue('sa_Total', saTotal);
    setValue('su_Total', suTotal);

    // Calculate grand total
    let grandTotal = 0;
    [
      moTotal,
      tuTotal,
      weTotal,
      thTotal,
      frTotal,
      saTotal,
      suTotal,
    ].forEach((total) => {
      if (total) {
        grandTotal += parseFloat(total);
      }
    });

    setValue(
      'gesamtstunden',
      grandTotal > 0 ? grandTotal.toFixed(1) : ''
    );
  }, [
    mo_Time_1,
    mo_Time_2,
    mo_Time_3,
    mo_Time_4,
    mo_Time_5,
    tu_Time_1,
    tu_Time_2,
    tu_Time_3,
    tu_Time_4,
    tu_Time_5,
    we_Time_1,
    we_Time_2,
    we_Time_3,
    we_Time_4,
    we_Time_5,
    th_Time_1,
    th_Time_2,
    th_Time_3,
    th_Time_4,
    th_Time_5,
    fr_Time_1,
    fr_Time_2,
    fr_Time_3,
    fr_Time_4,
    fr_Time_5,
    sa_Time_1,
    sa_Time_2,
    sa_Time_3,
    su_Time_1,
    su_Time_2,
    su_Time_3,
    setValue,
  ]);

  // Log errors wenn vorhanden
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('Validation errors:', errors);
    }
  }, [errors]);

  useEffect(() => {
    const fetchAusbilder = async () => {
      try {
        const response = await api.get('/api/user/ausbilder');
        setAusbilderList(response.data);
        return response.data;
      } catch (error: unknown) {
        if (error instanceof Error) {
          showToast(error.message, 'error');
        } else {
          showToast(t('nachweis.errorMessage'), 'error');
        }
        return [];
      }
    };
    const fetchUserProfile = async (ausbilder: Ausbilder[]) => {
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
          if (response.data.team) {
            const foundAusbilder = ausbilder.find(
              (a: Ausbilder) => a.name === response.data.team
            );
            if (foundAusbilder) {
              setCurrentAusbilder(foundAusbilder);
              setValue('ausbilderId', foundAusbilder.id);
            }
          }
        }
      } catch {
        setValue('name', user.name || '');
      }
    };

    const initialize = async () => {
      const ausbilder = await fetchAusbilder();
      if (user.isLoggedIn) {
        await fetchUserProfile(ausbilder);
      }
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.isLoggedIn]);

  const onSubmit = async (data: PdfGenerationFormValues) => {
    console.log('Form submitted with data:', data);

    // Prüfe erst, ob die Nummer bereits existiert
    try {
      const res = await api.get(
        `/api/nachweise/my-nachweise/exists/by-nummer/${data.nummer}`
      );
      if (res.data && res.data.exists) {
        const msg = `Sie haben bereits einen Nachweis mit der Nummer ${data.nummer}.`;
        setNummerError(msg);
        showToast(msg, 'error');
        return; // Verhindere das Absenden
      }
    } catch (error) {
      console.error('Fehler beim Prüfen der Nummer:', error);
      // Fahre trotzdem fort - der Server wird auch prüfen
    }

    setIsLoading(true);
    try {
      // Konvertiere die PDF-Felder in activities
      const activities = [];
      const dayMappings = [
        { prefix: 'mo', day: 'MONDAY' },
        { prefix: 'tu', day: 'TUESDAY' },
        { prefix: 'we', day: 'WEDNESDAY' },
        { prefix: 'th', day: 'THURSDAY' },
        { prefix: 'fr', day: 'FRIDAY' },
        { prefix: 'sa', day: 'SATURDAY' },
        { prefix: 'su', day: 'SUNDAY' },
      ];

      for (const { prefix, day } of dayMappings) {
        const maxSlots = prefix === 'sa' || prefix === 'su' ? 3 : 5;
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
        Date_Azubi: data.date_Azubi || null,
        Sig_Azubi: data.sig_Azubi || null,
        Sig_Ausbilder: data.sig_Ausbilder || null,
        Remark: data.remark || null,
      });
      showToast(t('nachweis.successMessage'), 'success');

      // Preview PDF without downloading
      if (response.data && response.data.id) {
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

        // Set PDF URL for preview only
        setPdfUrl(url);
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

  const renderDayFields = (dayPrefix: string, dayLabel: string) => (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold text-lg">{dayLabel}</h3>
      {[1, 2, 3, 4, 5].map((num) => (
        <div key={num} className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor={`${dayPrefix}_Sec_${num}`}>
                {t('nachweis.section')} {num}
              </Label>
              <Select
                value={String(
                  watch(
                    `${dayPrefix}_Sec_${num}` as keyof PdfGenerationFormValues
                  ) || ''
                )}
                onValueChange={(value) => {
                  setValue(
                    `${dayPrefix}_Sec_${num}` as keyof PdfGenerationFormValues,
                    value
                  );
                  // Wenn ein Bereich ausgewählt wird, leere die Tätigkeit
                  if (
                    value &&
                    value !==
                      watch(
                        `${dayPrefix}_Sec_${num}` as keyof PdfGenerationFormValues
                      )
                  ) {
                    setValue(
                      `${dayPrefix}_${num}` as keyof PdfGenerationFormValues,
                      ''
                    );
                  }
                }}
              >
                <SelectTrigger id={`${dayPrefix}_Sec_${num}`}>
                  <SelectValue placeholder="Bereich wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {BEREICH_TEMPLATES.map((bereich) => (
                    <SelectItem key={bereich} value={bereich}>
                      {bereich}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`${dayPrefix}_${num}`}>
                {t('nachweis.activity')} {num}
              </Label>
              <Select
                value={String(
                  watch(
                    `${dayPrefix}_${num}` as keyof PdfGenerationFormValues
                  ) || ''
                )}
                onValueChange={(value) => {
                  setValue(
                    `${dayPrefix}_${num}` as keyof PdfGenerationFormValues,
                    value
                  );
                }}
                disabled={
                  !watch(
                    `${dayPrefix}_Sec_${num}` as keyof PdfGenerationFormValues
                  )
                }
              >
                <SelectTrigger id={`${dayPrefix}_${num}`}>
                  <SelectValue placeholder="Tätigkeit wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {(watch(
                    `${dayPrefix}_Sec_${num}` as keyof PdfGenerationFormValues
                  )
                    ? TAETIGKEIT_TEMPLATES[
                        watch(
                          `${dayPrefix}_Sec_${num}` as keyof PdfGenerationFormValues
                        ) as string
                      ] || []
                    : []
                  ).map((taetigkeit) => (
                    <SelectItem key={taetigkeit} value={taetigkeit}>
                      {taetigkeit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`${dayPrefix}_Time_${num}`}>
                {t('nachweis.time')} {num}
              </Label>
              <Input
                id={`${dayPrefix}_Time_${num}`}
                {...register(
                  `${dayPrefix}_Time_${num}` as keyof PdfGenerationFormValues
                )}
              />
            </div>
          </div>
          {/* Bearbeitbare Textzeile unter den Dropdowns */}
          <div className="grid grid-cols-2 gap-2 pl-2">
            <div>
              <Input
                placeholder="Bereich anpassen..."
                value={String(
                  watch(
                    `${dayPrefix}_Sec_${num}` as keyof PdfGenerationFormValues
                  ) || ''
                )}
                onChange={(e) =>
                  setValue(
                    `${dayPrefix}_Sec_${num}` as keyof PdfGenerationFormValues,
                    e.target.value
                  )
                }
                className="text-sm"
              />
            </div>
            <div>
              <Input
                placeholder="Tätigkeit anpassen..."
                value={String(
                  watch(
                    `${dayPrefix}_${num}` as keyof PdfGenerationFormValues
                  ) || ''
                )}
                onChange={(e) =>
                  setValue(
                    `${dayPrefix}_${num}` as keyof PdfGenerationFormValues,
                    e.target.value
                  )
                }
                className="text-sm"
              />
            </div>
          </div>
        </div>
      ))}
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

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column - Form */}
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
              {/* Basis-Informationen */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold text-lg">
                  Basis-Informationen
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="name">{t('nachweis.name')}</Label>
                  <Input id="name" {...register('name')} />
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
                        <TrainerSelectItem
                          trainer={currentAusbilder}
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>

              {/* Datum und Nummern */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold text-lg">
                  Zeitraum & Nummer
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="datumStart">
                      {t('nachweis.datumStart')}
                    </Label>
                    <Input
                      id="datumStart"
                      type="date"
                      {...register('datumStart')}
                    />
                    {errors.datumStart && (
                      <p className="text-sm text-red-500">
                        {errors.datumStart.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="datumEnde">
                      {t('nachweis.datumEnde')}
                    </Label>
                    <Input
                      id="datumEnde"
                      type="date"
                      {...register('datumEnde')}
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
                    {...register('nummer', {
                      valueAsNumber: true,
                      onBlur: (
                        e: React.FocusEvent<HTMLInputElement>
                      ) => checkNummerExists(Number(e.target.value)),
                    })}
                    className={nummerError ? 'border-red-500' : ''}
                  />
                  {errors.nummer && (
                    <p className="text-sm text-red-500">
                      {errors.nummer.message}
                    </p>
                  )}
                  {nummerError && (
                    <p className="text-sm text-red-500">
                      {nummerError}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ausbildungsjahr">
                    {t('nachweis.ausbildungsjahr')}
                  </Label>
                  <Input
                    id="ausbildungsjahr"
                    placeholder={t(
                      'nachweis.ausbildungsjahrPlaceholder'
                    )}
                    {...register('ausbildungsjahr')}
                  />
                  {errors.ausbildungsjahr && (
                    <p className="text-sm text-red-500">
                      {errors.ausbildungsjahr.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="listEvery">
                    {t('nachweis.listEvery')}
                  </Label>
                  <Input id="listEvery" {...register('listEvery')} />
                </div>
              </div>

              {/* Wochentage */}
              {renderDayFields('mo', t('nachweis.monday'))}
              {renderDayFields('tu', t('nachweis.tuesday'))}
              {renderDayFields('we', t('nachweis.wednesday'))}
              {renderDayFields('th', t('nachweis.thursday'))}
              {renderDayFields('fr', t('nachweis.friday'))}

              {/* Samstag (nur 3 Felder) */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold text-lg">
                  {t('nachweis.saturday')}
                </h3>
                {[1, 2, 3].map((num) => (
                  <div key={num} className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor={`sa_Sec_${num}`}>
                          {t('nachweis.section')} {num}
                        </Label>
                        <Select
                          value={String(
                            watch(
                              `sa_Sec_${num}` as keyof PdfGenerationFormValues
                            ) || ''
                          )}
                          onValueChange={(value) => {
                            setValue(
                              `sa_Sec_${num}` as keyof PdfGenerationFormValues,
                              value
                            );
                            if (
                              value &&
                              value !==
                                watch(
                                  `sa_Sec_${num}` as keyof PdfGenerationFormValues
                                )
                            ) {
                              setValue(
                                `sa_${num}` as keyof PdfGenerationFormValues,
                                ''
                              );
                            }
                          }}
                        >
                          <SelectTrigger id={`sa_Sec_${num}`}>
                            <SelectValue placeholder="Bereich wählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            {BEREICH_TEMPLATES.map((bereich) => (
                              <SelectItem
                                key={bereich}
                                value={bereich}
                              >
                                {bereich}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`sa_${num}`}>
                          {t('nachweis.activity')} {num}
                        </Label>
                        <Select
                          value={String(
                            watch(
                              `sa_${num}` as keyof PdfGenerationFormValues
                            ) || ''
                          )}
                          onValueChange={(value) => {
                            setValue(
                              `sa_${num}` as keyof PdfGenerationFormValues,
                              value
                            );
                          }}
                          disabled={
                            !watch(
                              `sa_Sec_${num}` as keyof PdfGenerationFormValues
                            )
                          }
                        >
                          <SelectTrigger id={`sa_${num}`}>
                            <SelectValue placeholder="Tätigkeit wählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            {(watch(
                              `sa_Sec_${num}` as keyof PdfGenerationFormValues
                            )
                              ? TAETIGKEIT_TEMPLATES[
                                  watch(
                                    `sa_Sec_${num}` as keyof PdfGenerationFormValues
                                  ) as string
                                ] || []
                              : []
                            ).map((taetigkeit) => (
                              <SelectItem
                                key={taetigkeit}
                                value={taetigkeit}
                              >
                                {taetigkeit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`sa_Time_${num}`}>
                          {t('nachweis.time')} {num}
                        </Label>
                        <Input
                          id={`sa_Time_${num}`}
                          {...register(
                            `sa_Time_${num}` as keyof PdfGenerationFormValues
                          )}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pl-2">
                      <div>
                        <Input
                          placeholder="Bereich anpassen..."
                          value={String(
                            watch(
                              `sa_Sec_${num}` as keyof PdfGenerationFormValues
                            ) || ''
                          )}
                          onChange={(e) =>
                            setValue(
                              `sa_Sec_${num}` as keyof PdfGenerationFormValues,
                              e.target.value
                            )
                          }
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="Tätigkeit anpassen..."
                          value={String(
                            watch(
                              `sa_${num}` as keyof PdfGenerationFormValues
                            ) || ''
                          )}
                          onChange={(e) =>
                            setValue(
                              `sa_${num}` as keyof PdfGenerationFormValues,
                              e.target.value
                            )
                          }
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sonntag (nur 3 Felder) */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold text-lg">
                  {t('nachweis.sunday')}
                </h3>
                {[1, 2, 3].map((num) => (
                  <div key={num} className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor={`su_Sec_${num}`}>
                          {t('nachweis.section')} {num}
                        </Label>
                        <Select
                          value={String(
                            watch(
                              `su_Sec_${num}` as keyof PdfGenerationFormValues
                            ) || ''
                          )}
                          onValueChange={(value) => {
                            setValue(
                              `su_Sec_${num}` as keyof PdfGenerationFormValues,
                              value
                            );
                            if (
                              value &&
                              value !==
                                watch(
                                  `su_Sec_${num}` as keyof PdfGenerationFormValues
                                )
                            ) {
                              setValue(
                                `su_${num}` as keyof PdfGenerationFormValues,
                                ''
                              );
                            }
                          }}
                        >
                          <SelectTrigger id={`su_Sec_${num}`}>
                            <SelectValue placeholder="Bereich wählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            {BEREICH_TEMPLATES.map((bereich) => (
                              <SelectItem
                                key={bereich}
                                value={bereich}
                              >
                                {bereich}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`su_${num}`}>
                          {t('nachweis.activity')} {num}
                        </Label>
                        <Select
                          value={String(
                            watch(
                              `su_${num}` as keyof PdfGenerationFormValues
                            ) || ''
                          )}
                          onValueChange={(value) => {
                            setValue(
                              `su_${num}` as keyof PdfGenerationFormValues,
                              value
                            );
                          }}
                          disabled={
                            !watch(
                              `su_Sec_${num}` as keyof PdfGenerationFormValues
                            )
                          }
                        >
                          <SelectTrigger id={`su_${num}`}>
                            <SelectValue placeholder="Tätigkeit wählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            {(watch(
                              `su_Sec_${num}` as keyof PdfGenerationFormValues
                            )
                              ? TAETIGKEIT_TEMPLATES[
                                  watch(
                                    `su_Sec_${num}` as keyof PdfGenerationFormValues
                                  ) as string
                                ] || []
                              : []
                            ).map((taetigkeit) => (
                              <SelectItem
                                key={taetigkeit}
                                value={taetigkeit}
                              >
                                {taetigkeit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`su_Time_${num}`}>
                          {t('nachweis.time')} {num}
                        </Label>
                        <Input
                          id={`su_Time_${num}`}
                          {...register(
                            `su_Time_${num}` as keyof PdfGenerationFormValues
                          )}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pl-2">
                      <div>
                        <Input
                          placeholder="Bereich anpassen..."
                          value={String(
                            watch(
                              `su_Sec_${num}` as keyof PdfGenerationFormValues
                            ) || ''
                          )}
                          onChange={(e) =>
                            setValue(
                              `su_Sec_${num}` as keyof PdfGenerationFormValues,
                              e.target.value
                            )
                          }
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="Tätigkeit anpassen..."
                          value={String(
                            watch(
                              `su_${num}` as keyof PdfGenerationFormValues
                            ) || ''
                          )}
                          onChange={(e) =>
                            setValue(
                              `su_${num}` as keyof PdfGenerationFormValues,
                              e.target.value
                            )
                          }
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Gesamtstunden & Bemerkung */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold text-lg">
                  Zusammenfassung
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="gesamtstunden">
                    {t('nachweis.gesamtstunden')}
                  </Label>
                  <Input
                    id="gesamtstunden"
                    {...register('gesamtstunden')}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remark">
                    {t('nachweis.remark')}
                  </Label>
                  <Input id="remark" {...register('remark')} />
                </div>
              </div>

              {/* Ausbilder & Unterschriften */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold text-lg">
                  Ausbilder & Unterschriften
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="ausbilderId">
                    {t('nachweis.ausbilder')}
                  </Label>
                  <Select
                    value={String(watch('ausbilderId') || '')}
                    onValueChange={(value) =>
                      setValue('ausbilderId', value)
                    }
                  >
                    <SelectTrigger id="ausbilderId">
                      <SelectValue asChild>
                        {watch('ausbilderId') ? (
                          <TrainerSelectItem
                            trainer={
                              ausbilderList.find(
                                (a) => a.id === watch('ausbilderId')
                              ) || ausbilderList[0]
                            }
                          />
                        ) : (
                          <span>
                            {t('nachweis.ausbilderPlaceholder')}
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {ausbilderList.map((ausbilder) => (
                        <SelectItem
                          key={ausbilder.id}
                          value={ausbilder.id}
                        >
                          <TrainerSelectItem trainer={ausbilder} />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.ausbilderId && (
                    <p className="text-sm text-red-500">
                      {errors.ausbilderId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_Azubi">
                    {t('nachweis.dateAzubi')}
                  </Label>
                  <Input
                    id="date_Azubi"
                    type="date"
                    {...register('date_Azubi')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sig_Azubi">
                    {t('nachweis.sigAzubi')}
                  </Label>
                  <Input id="sig_Azubi" {...register('sig_Azubi')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sig_Ausbilder">
                    {t('nachweis.sigAusbilder')}
                  </Label>
                  <Input
                    id="sig_Ausbilder"
                    {...register('sig_Ausbilder')}
                  />
                </div>
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
              <Button
                type="button"
                onClick={() => {
                  console.log(
                    'Created Nachweis ID:',
                    createdNachweisId
                  );
                  console.log('Auth Token:', user.token);
                }}
              >
                Log Info
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column - PDF Preview */}
        <div className="lg:sticky lg:top-6">
          <Card className="w-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">
                  PDF Vorschau
                </CardTitle>
                <div className="flex gap-2">
                  {pdfUrl && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleDownloadPdf}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        PDF herunterladen
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          reset();
                          if (pdfUrl) {
                            window.URL.revokeObjectURL(pdfUrl);
                          }
                          setPdfUrl(null);
                          setCreatedNachweisId(null);
                        }}
                      >
                        Neuer Nachweis
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {pdfUrl ? (
                <div className="space-y-4">
                  <iframe
                    src={pdfUrl}
                    className="w-full h-[calc(100vh-16rem)] border rounded-lg shadow-sm"
                    title="PDF Preview"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)] border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-gray-400 mb-4"
                    fill="none"
                    viewBox="_0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-500 text-center font-medium">
                    Kein PDF vorhanden
                  </p>
                  <p className="text-gray-400 text-sm text-center mt-2">
                    Erstellen Sie einen Nachweis,
                    <br />
                    um die Vorschau zu sehen
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
