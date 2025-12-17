'use client';

import { useTranslation } from '@/context/LanguageContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Cloud,
  Users,
  Lock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  const { t, locale } = useTranslation();

  const content = {
    de: {
      title: 'Über NachweisWelt',
      subtitle: 'Die Lösung für digitale Ausbildungsnachweise',
      problem: 'Das Problem',
      problemDesc:
        'Als Azubi war die Verwaltung von Ausbildungsnachweisen eine zeitaufwändige und fehleranfällige Aufgabe:',
      problems: [
        'Nachweise mussten manuell und handschriftlich auf Papier eingetragen werden',
        'Dokumentation musste lokal auf dem eigenen Rechner gespeichert werden',
        'Regelmäßiges Verteilen der Nachweise an die IHK und den Ausbilder über E-Mail',
        'Die damalige Seite war häufig nicht erreichbar oder downtime',
        'Keine zentrale Verwaltung oder Versionskontrolle',
        'Risiko von Datenverlust durch lokale Speicherung',
      ],
      solution: 'Die Lösung',
      solutionDesc:
        'NachweisWelt bietet eine moderne, cloudbasierte Lösung:',
      solutions: [
        {
          title: 'Cloud-Speicherung',
          description:
            'Alle Nachweise werden sicher in der Cloud gespeichert und sind jederzeit abrufbar',
          icon: Cloud,
        },
        {
          title: 'Rollenbasierte Verwaltung',
          description:
            'Azubis, Ausbilder und Admins haben unterschiedliche Rechte und Sichtbarkeiten',
          icon: Users,
        },
        {
          title: 'Sichere Daten',
          description:
            'Deine Nachweise sind verschlüsselt und durch moderne Sicherheitsmaßnahmen geschützt',
          icon: Lock,
        },
        {
          title: '100% Verfügbarkeit',
          description:
            'Die Anwendung ist zuverlässig und wurde für Hochverfügbarkeit entwickelt',
          icon: CheckCircle,
        },
      ],
      benefits: 'Deine Vorteile',
      benefitsText:
        'Mit NachweisWelt sparst du Zeit, sicherst deine Daten und hast volle Transparenz über deine Ausbildungsnachweise. Alles digital, jederzeit und überall verfügbar.',
    },
    en: {
      title: 'About NachweisWelt',
      subtitle: 'The solution for digital training records',
      problem: 'The Problem',
      problemDesc:
        'As an apprentice, managing training records was a time-consuming and error-prone task:',
      problems: [
        'Records had to be manually entered on paper',
        'Documentation had to be stored locally on your own computer',
        'Regular distribution of records to the chamber of commerce and your trainer via email',
        'The old platform was frequently unavailable or offline',
        'No central management or version control',
        'Risk of data loss due to local storage',
      ],
      solution: 'The Solution',
      solutionDesc:
        'NachweisWelt provides a modern, cloud-based solution:',
      solutions: [
        {
          title: 'Cloud Storage',
          description:
            'All records are securely stored in the cloud and accessible at any time',
          icon: Cloud,
        },
        {
          title: 'Role-Based Management',
          description:
            'Apprentices, trainers, and admins have different permissions and visibility',
          icon: Users,
        },
        {
          title: 'Secure Data',
          description:
            'Your records are encrypted and protected by modern security measures',
          icon: Lock,
        },
        {
          title: '100% Availability',
          description:
            'The application is reliable and built for high availability',
          icon: CheckCircle,
        },
      ],
      benefits: 'Your Benefits',
      benefitsText:
        'With NachweisWelt, you save time, secure your data, and have full transparency over your training records. Everything digital, available anywhere, anytime.',
    },
  };

  const lang = locale === 'de' ? 'de' : 'en';
  const data = content[lang];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {data.title}
          </h1>
          <p className="text-xl text-muted-foreground">
            {data.subtitle}
          </p>
        </div>

        {/* Problem Section */}
        <Card className="mb-8 border border-border bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <AlertCircle className="h-6 w-6 text-destructive" />
              {data.problem}
            </CardTitle>
            <CardDescription>{data.problemDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.problems.map((problem, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-semibold text-destructive">
                      ✕
                    </span>
                  </div>
                  <span className="text-foreground">{problem}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Solution Section */}
        <Card className="mb-8 border border-border bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CheckCircle className="h-6 w-6 text-primary" />
              {data.solution}
            </CardTitle>
            <CardDescription>{data.solutionDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.solutions.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <Card className="border border-border bg-primary/5">
          <CardHeader>
            <CardTitle className="text-2xl">
              {data.benefits}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground text-lg leading-relaxed">
              {data.benefitsText}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
