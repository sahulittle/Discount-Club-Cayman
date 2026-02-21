import BusinessProfileContent from './components/BusinessProfileContent';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BusinessProfilePage({ params }: PageProps) {
  const { id } = await params;
  return <BusinessProfileContent businessId={id} />;
}