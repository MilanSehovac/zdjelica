"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, registerAction } from "@/app/actions/auth";
import type { FormState } from "@/lib/form-state";

function Err({ id, text }: { id: string; text?: string }) {
  return text ? (
    <p id={id} className="field-error">
      {text}
    </p>
  ) : null;
}

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, {});
  const err = state.errors ?? {};
  return (
    <form action={action} noValidate className="space-y-5">
      <input type="hidden" name="next" value={next} />
      {state.message ? (
        <p role="alert" className="rounded-xl border-2 border-coral bg-white px-4 py-3 font-semibold text-coral">
          {state.message}
        </p>
      ) : null}
      <div>
        <label htmlFor="email" className="label">E-mail</label>
        <input id="email" name="email" type="email" inputMode="email" autoComplete="email" className="field" defaultValue={state.values?.email} aria-invalid={err.email ? true : undefined} aria-describedby={err.email ? "email-error" : undefined} />
        <Err id="email-error" text={err.email} />
      </div>
      <div>
        <label htmlFor="password" className="label">Lozinka</label>
        <input id="password" name="password" type="password" autoComplete="current-password" className="field" aria-invalid={err.password ? true : undefined} aria-describedby={err.password ? "password-error" : undefined} />
        <Err id="password-error" text={err.password} />
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Prijava..." : "Prijavi se"}
      </button>
      <p className="text-center text-ink-soft">
        Nemate račun? <Link href={`/registracija?next=${encodeURIComponent(next)}`} className="font-semibold">Registrujte se</Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(registerAction, {});
  const err = state.errors ?? {};
  return (
    <form action={action} noValidate className="space-y-5">
      <input type="hidden" name="next" value={next} />
      {state.message ? (
        <p role="alert" className="rounded-xl border-2 border-coral bg-white px-4 py-3 font-semibold text-coral">
          {state.message}
        </p>
      ) : null}
      <div>
        <label htmlFor="name" className="label">Ime</label>
        <input id="name" name="name" type="text" autoComplete="name" className="field" defaultValue={state.values?.name} aria-invalid={err.name ? true : undefined} aria-describedby={err.name ? "name-error" : undefined} />
        <Err id="name-error" text={err.name} />
      </div>
      <div>
        <label htmlFor="email" className="label">E-mail</label>
        <input id="email" name="email" type="email" inputMode="email" autoComplete="email" className="field" defaultValue={state.values?.email} aria-invalid={err.email ? true : undefined} aria-describedby={err.email ? "email-error" : undefined} />
        <Err id="email-error" text={err.email} />
      </div>
      <div>
        <label htmlFor="password" className="label">Lozinka</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} className="field" aria-invalid={err.password ? true : undefined} aria-describedby={err.password ? "password-error" : "password-hint"} />
        {err.password ? <Err id="password-error" text={err.password} /> : <p id="password-hint" className="mt-1 text-sm text-ink-soft">Najmanje 8 znakova.</p>}
      </div>
      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" name="terms" className="mt-1.5 h-5 w-5 shrink-0 accent-teal" aria-invalid={err.terms ? true : undefined} aria-describedby={err.terms ? "terms-error" : undefined} />
          <span>
            Prihvatam <Link href="/uslovi-koristenja">uslove korištenja</Link> i <Link href="/politika-privatnosti">politiku privatnosti</Link>.
          </span>
        </label>
        <Err id="terms-error" text={err.terms} />
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Pravim račun..." : "Napravi račun"}
      </button>
      <p className="text-center text-ink-soft">
        Već imate račun? <Link href={`/prijava?next=${encodeURIComponent(next)}`} className="font-semibold">Prijavite se</Link>
      </p>
    </form>
  );
}
