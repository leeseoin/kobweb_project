import ApiTester from '@/components/ApiTester';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">개발자 테스트 페이지</h1>
        <ApiTester />
      </div>
    </div>
  );
}