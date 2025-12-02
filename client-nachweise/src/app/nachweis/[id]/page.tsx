import NachweisViewer from '@/features/nachweise/NachweisViewer';

interface Props {
  params: any;
}

export default async function NachweisPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="container mx-auto p-6">
      <NachweisViewer id={id} />
    </div>
  );
}
