import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TestSessionPage() {
  const session = await auth();
  return (
    <div className="p-10 text-xl font-bold bg-white text-black min-h-screen">
      <h1>Session Test</h1>
      <pre className="mt-4 p-4 bg-gray-100 rounded text-sm font-mono whitespace-pre-wrap">
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  );
}
