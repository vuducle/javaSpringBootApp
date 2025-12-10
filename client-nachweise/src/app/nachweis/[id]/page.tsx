import type { Metadata } from 'next';
import NachweisViewer from '@/features/nachweise/NachweisViewer';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Nachweis ansehen',
};

export default async function NachweisPage({ params }: Props) {
  // Next.js may provide params as a Promise in some cases; await to unwrap.
  const { id } = await params;
  return (
    <div className="container mx-auto p-6">
      <NachweisViewer id={id} />
    </div>
  );
}
