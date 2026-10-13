import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth-forms";
import { pageMetadata } from "@/lib/seo";
import { getCurrentUser, safeNext } from "@/lib/session";

export const metadata = pageMetadata({ title: "Prijava", description: "Prijavite se na svoj račun.", path: "/prijava", noindex: true });

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const target = safeNext(next);
  if (await getCurrentUser()) redirect(target);
  return (
    <div className="container-page max-w-md py-12">
      <h1 className="mb-2 text-[clamp(1.9rem,3vw+0.6rem,2.6rem)]">Prijava</h1>
      <p className="mb-8 text-ink-soft">Prijavite se da vidite omiljene proizvode i prethodne narudžbe.</p>
      <div className="card p-6">
        <LoginForm next={target} />
      </div>
    </div>
  );
}
