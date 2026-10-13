"use client";

import { useActionState } from "react";
import { subscribeAction } from "@/app/actions/newsletter";
import type { FormState } from "@/lib/form-state";

export function NewsletterForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribeAction, {});
  const error = state.errors?.email;

  return (
    <form action={action} noValidate className="flex flex-col gap-3">
      <div>
        <label htmlFor="newsletter-email" className="label">
          E-mail adresa
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="newsletter-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            defaultValue={state.values?.email}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "newsletter-error" : "newsletter-note"}
            className="field text-ink"
            placeholder="ime@primjer.ba"
          />
          <button type="submit" disabled={pending} className="btn btn-primary shrink-0">
            {pending ? "Šaljem..." : "Prijavi me"}
          </button>
        </div>
        {error ? (
          <p id="newsletter-error" className="field-error" style={{ color: "#ffd9d2" }}>
            {error}
          </p>
        ) : null}
      </div>
      {/* Polje-mamac za botove */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <p id="newsletter-note" className="text-sm text-white/80">
        Prijavom pristajete da primate e-poruke od Zdjelice. Odjava je moguća u svakom trenutku.
      </p>
      <p role="status" className="min-h-6 font-semibold text-butter">
        {state.ok ? state.message : state.message ? <span style={{ color: "#ffd9d2" }}>{state.message}</span> : null}
      </p>
    </form>
  );
}
