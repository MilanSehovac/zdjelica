import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth-forms";
import { pageMetadata } from "@/lib/seo";
import { getCurrentUser, safeNext } from "@/lib/session";

export const metadata = pageMetadata({ title: "Registracija", description: "Napravite besplatan račun.", path: "/registracija", noindex: true });

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const target = safeNext(next);
  if (await getCurrentUser()) redirect(target);
  return (
    <div className="container-page max-w-md py-12">
      <h1 className="mb-2 text-[clamp(1.9rem,3vw+0.6rem,2.6rem)]">Napravite račun</h1>
      <p className="mb-8 text-ink-soft">Sa računom čuvate omiljene proizvode i dobijate podsjetnik za redovnu narudžbu.</p>
      <div className="card p-6">
        <RegisterForm next={target} />
      </div>
    </div>
  );
}
