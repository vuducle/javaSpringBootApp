'use client';

import { EditNachweisForm } from '@/features/nachweise/EditNachweisForm';
import { useParams } from 'next/navigation';

export default function EditNachweisPageClient() {
  const params = useParams();
  const nachweisId = params.id as string;

  return (
    <div className="container mx-auto py-8">
      <EditNachweisForm nachweisId={nachweisId} />
    </div>
  );
}
