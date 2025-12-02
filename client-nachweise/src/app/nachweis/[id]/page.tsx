import NachweisViewer from '@/features/nachweise/NachweisViewer';

interface Props {
  params: any;
}

export default async function NachweisPage({ params }: Props) {
  // Next.js may provide params as a Promise in some cases; await to unwrap.
  const { id } = await params;
  return (
    <div className="container mx-auto p-6">
      <NachweisViewer id={id} />
    </div>
  );
}
