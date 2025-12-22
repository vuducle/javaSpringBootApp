// Templates für Bereiche und Tätigkeiten
export const BEREICH_TEMPLATES = [
  'Entwickeln',
  'Designen',
  'Meeting',
  'Schule',
  'Sonstiges',
] as const;

export const TAETIGKEIT_TEMPLATES: Record<string, string[]> = {
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

export interface DayMapping {
  prefix: string;
  day: string;
  label: string;
  maxSlots: number;
}

export const DAY_MAPPINGS: DayMapping[] = [
  { prefix: 'mo', day: 'MONDAY', label: 'Montag', maxSlots: 5 },
  { prefix: 'tu', day: 'TUESDAY', label: 'Dienstag', maxSlots: 5 },
  { prefix: 'we', day: 'WEDNESDAY', label: 'Mittwoch', maxSlots: 5 },
  { prefix: 'th', day: 'THURSDAY', label: 'Donnerstag', maxSlots: 5 },
  { prefix: 'fr', day: 'FRIDAY', label: 'Freitag', maxSlots: 5 },
  { prefix: 'sa', day: 'SATURDAY', label: 'Samstag', maxSlots: 3 },
  { prefix: 'su', day: 'SUNDAY', label: 'Sonntag', maxSlots: 3 },
];
