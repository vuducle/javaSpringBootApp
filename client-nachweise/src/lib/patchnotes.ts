export interface Version {
  version: string;
  releaseDate: string;
  features?: string[];
  bugfixes?: string[];
  improvements?: string[];
}

export const PATCHNOTES: Version[] = [
  {
    version: '1.2.0',
    releaseDate: '2025-12-19',
    improvements: [
      'Optimized profile image handling and caching',
      'Improved query performance',
    ],
    features: ['Monitoring Dashboard for Trainer/Ausbilder/in'],
  },
  {
    version: '1.1.2',
    releaseDate: '2025-12-18',
    bugfixes: [
      'Der Trainer/Ausbilder/in will be fetched instead of a String',
    ],
  },
  {
    version: '1.1.1',
    releaseDate: '2025-12-15',
    bugfixes: ['Bugfix mit Validations bei den Profilen'],
  },
  {
    version: '1.1.0',
    releaseDate: '2025-12-10',
    features: ['Email Confirmation', 'User Registration System'],
  },
  {
    version: '1.0.0',
    releaseDate: '2025-12-01',
    features: ['Initial Release', 'Admin Panel', 'Core Features'],
  },
];

export const getCurrentVersion = () => {
  return PATCHNOTES[0].version;
};
