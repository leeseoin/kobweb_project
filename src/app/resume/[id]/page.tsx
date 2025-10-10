
import ResumeDetail from './ResumeDetail';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
  ];
}

export default function ResumePage({ params }: { params: { id: string } }) {
  return <ResumeDetail resumeId={params.id} />;
}
