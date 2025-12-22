# Nachweise Frontend - Next.js Application

Modernes Next.js 15 Frontend zur Verwaltung von Ausbildungsnachweisen mit TypeScript, Tailwind CSS, shadcn/ui und SWR für State Management.

---

## 🎯 Features

### Für Auszubildende (Azubis)

- ✅ **Nachweise erstellen & bearbeiten** - Intuitive Formular-Oberfläche
- 📊 **Dashboard** - Übersicht aller eigenen Nachweise
- 📄 **PDF-Download** - Generierte Nachweise herunterladen
- 🔔 **Benachrichtigungen** - Echtzeit-Updates bei Statusänderungen
- 👤 **Profilverwaltung** - Profilbild und persönliche Daten
- 📦 **Batch-Export** - Mehrere Nachweise als ZIP herunterladen
- 🗑️ **Batch-Delete** - Mehrere Nachweise gleichzeitig löschen
- 🌐 **Mehrsprachig** - Deutsch/Englisch (i18n)

### Für Ausbilder/innen

- 📑 **Nachweise prüfen** - Alle eingereichten Nachweise
- ✅ **Genehmigen/Ablehnen** - Mit Kommentar-Funktion
- ⚡ **Batch-Operationen** - Mehrere Nachweise gleichzeitig genehmigen/ablehnen
- 📊 **Dashboard** - Statistiken und Übersichten
- 💬 **Feedback geben** - Konstruktive Rückmeldungen

### Für Administratoren

- 🔑 **Benutzerverwaltung** - CRUD für alle Benutzer
- 📝 **Audit-Logs** - System-Aktivitäten nachverfolgen
- 👥 **Rollenverwaltung** - Rollen zuweisen
- ⚙️ **Systemverwaltung** - Konfiguration

---

## 🚀 Quick Start

### Voraussetzungen

- Node.js 18+ oder Bun
- NPM, Yarn, PNPM oder Bun
- Backend API läuft auf Port 8088

### Installation

```bash
npm install
# oder
yarn install
# oder
pnpm install
# oder
bun install
```

### Development Server starten

```bash
npm run dev
# oder
yarn dev
# oder
pnpm dev
# oder
bun dev
```

Öffne [http://localhost:3000](http://localhost:3000) im Browser.

### Production Build

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

---

## 📁 Projektstruktur

```
src/
├── app/                      # Next.js App Router
│   ├── about/               # About-Seite
│   ├── admin/               # Admin-Panel
│   ├── audit-logs/          # Audit-Log-Übersicht
│   ├── erstellen/           # Nachweis erstellen
│   ├── login/               # Login-Seite
│   ├── nachweis/            # Einzelner Nachweis
│   ├── nachweise-anschauen/ # Alle Nachweise (Azubi)
│   ├── profil/              # Profil-Seite
│   ├── register/            # Registrierung
│   ├── user-erstellen/      # Benutzer erstellen (Admin)
│   ├── layout.tsx           # Root Layout
│   ├── page.tsx             # Homepage
│   └── globals.css          # Globale Styles
├── components/              # Wiederverwendbare Komponenten
│   ├── core/               # Core-Komponenten (Header, Footer, etc.)
│   ├── notifications/      # Benachrichtigungs-System
│   └── ui/                 # shadcn/ui Komponenten
├── context/                # React Context Providers
│   └── LanguageContext.tsx # i18n Context
├── features/               # Feature-spezifische Komponenten
│   ├── auth/              # Authentifizierung
│   ├── dashboard/         # Dashboard-Komponenten
│   ├── nachweise/         # Nachweis-Management
│   │   ├── AllNachweiseView.tsx      # Azubi-Ansicht
│   │   ├── AdminNachweiseView.tsx    # Admin/Ausbilder-Ansicht
│   │   ├── NachweisForm.tsx          # Formular
│   │   └── NachweisDetail.tsx        # Detail-Ansicht
│   └── info/              # Info-Seiten
├── hooks/                 # Custom React Hooks
│   ├── useAuth.ts        # Authentifizierung
│   ├── useNachweise.ts   # Nachweise-API
│   └── useToast.ts       # Toast-Benachrichtigungen
├── lib/                   # Utility-Funktionen
│   ├── api.ts            # API-Client
│   ├── auth.ts           # Auth-Helpers
│   └── utils.ts          # Allgemeine Utils
├── locales/              # i18n Übersetzungen
│   ├── de.json          # Deutsch
│   └── en.json          # Englisch
└── store/                # Redux/Zustand Store
    ├── authSlice.ts     # Auth-State
    └── store.ts         # Store-Konfiguration
```

---

## 🎨 UI-Komponenten (shadcn/ui)

Das Projekt nutzt [shadcn/ui](https://ui.shadcn.com/) für moderne, zugängliche UI-Komponenten:

- **Button** - Verschiedene Variants (default, destructive, outline, etc.)
- **Dialog** - Modale Dialoge
- **Input** - Formular-Inputs
- **Select** - Dropdown-Auswahl
- **Table** - Datentabellen mit Sortierung
- **Textarea** - Mehrzeilige Texteingabe
- **Toast** - Benachrichtigungen
- **Card** - Container-Komponenten
- **Badge** - Status-Badges
- **Checkbox** - Multi-Select
- **Avatar** - Benutzerbilder
- **Tabs** - Tab-Navigation

Konfiguration: `components.json`

### Neue Komponente hinzufügen

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
```

---

## 🌐 Internationalisierung (i18n)

### Unterstützte Sprachen

- 🇩🇪 Deutsch (Standard)
- 🇬🇧 Englisch

### Übersetzungs-Dateien

- `src/locales/de.json`
- `src/locales/en.json`

### Verwendung im Code

```tsx
import { useLanguage } from '@/context/LanguageContext';

function MyComponent() {
  const { t } = useLanguage();

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('dashboard.totalNachweise')}</p>
    </div>
  );
}
```

### Neue Übersetzung hinzufügen

In `de.json` und `en.json`:

```json
{
  "myNewKey": "Meine neue Übersetzung",
  "nested": {
    "key": "Verschachtelter Wert"
  }
}
```

---

## 🔌 API-Integration

### API-Client Setup

```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor für JWT-Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### SWR für Data Fetching

```tsx
import useSWR from 'swr';

function NachweiseList() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/nachweise',
    fetcher
  );

  if (isLoading) return <Spinner />;
  if (error) return <Error />;

  return (
    <div>
      {data.map((nachweis) => (
        <NachweisCard key={nachweis.id} nachweis={nachweis} />
      ))}
    </div>
  );
}
```

### Batch-Operationen

```typescript
// Batch-Export
async function exportNachweise(ids: string[]) {
  const response = await api.post(
    '/api/nachweise/batch-export',
    {
      nachweisIds: ids,
    },
    {
      responseType: 'blob',
    }
  );

  // Download als ZIP
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'nachweise.zip';
  link.click();
}

// Batch-Delete
async function deleteNachweise(ids: string[]) {
  const response = await api.post('/api/nachweise/batch-delete', {
    nachweisIds: ids,
  });

  return response.data; // { deletedCount, failedCount, failedIds }
}

// Batch-Status-Update (Admin/Ausbilder)
async function updateNachweiseStatus(
  ids: string[],
  status: 'ANGENOMMEN' | 'ABGELEHNT',
  comment?: string
) {
  const response = await api.put('/api/nachweise/batch-status', {
    nachweisIds: ids,
    status,
    comment,
  });

  return response.data; // { updatedCount, failedCount, message }
}
```

---

## 🎯 Wichtige Features

### 1. Batch-Operationen für Azubis

**AllNachweiseView.tsx** - Azubi-Ansicht mit:

- ☑️ Multi-Select Checkboxes
- 📦 Batch-Export Button (ZIP-Download)
- 🗑️ Batch-Delete Button mit Bestätigungsdialog
- 📊 Statusfilter und Suche

```tsx
// Beispiel: Batch-Export
const handleBatchExport = async () => {
  setIsBatchExporting(true);
  try {
    const response = await api.post(
      '/api/nachweise/batch-export',
      {
        nachweisIds: selectedNachweise,
      },
      { responseType: 'blob' }
    );

    // Download triggern
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nachweise_${new Date().toISOString()}.zip`;
    link.click();

    toast.success(t('batchExportSuccess'));
  } catch (error) {
    toast.error(t('batchExportError'));
  } finally {
    setIsBatchExporting(false);
  }
};
```

### 2. Batch-Genehmigung für Ausbilder

**AdminNachweiseView.tsx** - Admin/Ausbilder-Ansicht mit:

- ✅ Batch-Approve Button (grün)
- ❌ Batch-Reject Button (rot)
- 💬 Optionaler Kommentar bei Batch-Updates
- 📧 Automatische E-Mail-Benachrichtigungen an Azubis

```tsx
// Beispiel: Batch-Approve
const handleBatchStatusUpdate = async () => {
  setIsBatchUpdatingStatus(true);
  try {
    const response = await api.put('/api/nachweise/batch-status', {
      nachweisIds: selectedNachweise,
      status: batchStatusAction, // 'ANGENOMMEN' oder 'ABGELEHNT'
      comment: batchStatusComment,
    });

    toast.success(
      `${response.data.updatedCount} ${t('nachweiseWereUpdated')}`
    );

    // Daten neu laden
    mutate();
    setSelectedNachweise([]);
  } catch (error) {
    toast.error(t('batchStatusUpdateError'));
  } finally {
    setIsBatchUpdatingStatus(false);
    setBatchStatusDialogOpen(false);
  }
};
```

### 3. Formular-Validierung

```tsx
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const nachweisSchema = z.object({
  titel: z
    .string()
    .min(3, 'Titel muss mindestens 3 Zeichen lang sein'),
  beschreibung: z.string().min(10, 'Beschreibung zu kurz'),
  datum: z.string(),
  dauer: z.number().min(1).max(1440),
});

function NachweisForm() {
  const form = useForm({
    resolver: zodResolver(nachweisSchema),
  });

  const onSubmit = async (data) => {
    await api.post('/api/nachweise', data);
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

### 4. Authentifizierung & Protected Routes

```tsx
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken');

  if (!token && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/profil/:path*', '/nachweise/:path*'],
};
```

---

## 🎨 Styling

### Tailwind CSS

Das Projekt nutzt Tailwind CSS mit custom Theme:

```javascript
// tailwind.config.mjs
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          // ...
          900: '#1e3a8a',
        },
        // Custom colors für Status-Badges
        status: {
          eingereicht: '#FCD34D',
          angenommen: '#34D399',
          abgelehnt: '#F87171',
        },
      },
    },
  },
};
```

### Custom CSS Variables

In `globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  --destructive: 0 84.2% 60.2%;
  --muted: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

---

## 🧪 Testing (geplant)

```bash
# Unit Tests
npm run test

# E2E Tests (Playwright)
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 🔧 Environment Variables

Erstelle eine `.env.local` Datei:

```bash
# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:8088

# Environment
NODE_ENV=development

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## 🐳 Docker

### Development

```bash
docker build -t nachweise-frontend:dev .
docker run -p 3000:3000 nachweise-frontend:dev
```

### Production

```bash
docker build -t nachweise-frontend:prod --target production .
docker run -p 3000:3000 nachweise-frontend:prod
```

### Mit Docker Compose

```bash
docker-compose up -d frontend
```

---

## 📊 Performance-Optimierung

- ✅ **Code Splitting** - Automatisch durch Next.js
- ✅ **Image Optimization** - `next/image` für alle Bilder
- ✅ **Font Optimization** - `next/font` für Webfonts
- ✅ **Bundle Analysis** - `@next/bundle-analyzer`
- ✅ **SWR Caching** - Intelligentes Data Fetching

### Bundle Analyzer

```bash
npm run analyze
```

---

## 🛠️ Troubleshooting

### Module not found

```bash
# Cache löschen
rm -rf .next node_modules
npm install
```

### API-Verbindung fehl

1. Backend läuft? `curl http://localhost:8088/actuator/health`
2. CORS konfiguriert? Siehe Backend CORS-Config
3. `.env.local` korrekt? `NEXT_PUBLIC_API_URL=http://localhost:8088`

### Styling funktioniert nicht

```bash
# Tailwind neu generieren
npm run dev
# oder
npx tailwindcss -i ./src/app/globals.css -o ./dist/output.css --watch
```

### TypeScript-Fehler

```bash
# Type Check
npm run type-check

# oder direkt
npx tsc --noEmit
```

---

## 🚀 Deployment

### Vercel (empfohlen)

```bash
# Mit Vercel CLI
npm i -g vercel
vercel
```

Oder: Repository mit Vercel verbinden für automatisches Deployment.

### Docker Deployment

```bash
# Production Build
docker build -t nachweise-frontend:latest .

# Container starten
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.example.com \
  nachweise-frontend:latest
```

### Static Export (optional)

```bash
# next.config.ts
export default {
  output: 'export',
}

# Build
npm run build
# → Erstellt ./out/ Verzeichnis für statisches Hosting
```

---

## 📚 Weitere Ressourcen

- [Next.js Dokumentation](https://nextjs.org/docs)
- [React Dokumentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [SWR](https://swr.vercel.app)
- [TypeScript](https://www.typescriptlang.org/docs)

---

## 🧩 Technologie-Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: SWR + React Context
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Internationalization**: Custom i18n Context
- **Icons**: Lucide React
- **Date Handling**: date-fns

---

**Viel Erfolg beim Entwickeln! 🚀**
