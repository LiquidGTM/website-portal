import { redirect } from 'next/navigation';

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-red-600">Invalid Link</h1>
          <p className="text-neutral-600">No verification token found.</p>
        </div>
      </div>
    );
  }

  // Delegate to API route which can set cookies and redirect
  redirect(`/api/auth/verify?token=${encodeURIComponent(token)}`);
}
