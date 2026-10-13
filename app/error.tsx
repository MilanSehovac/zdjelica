"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-page py-20">
      <h1 className="max-w-2xl">Nešto nije u redu s našim serverom</h1>
      <p className="mb-8 mt-4 max-w-xl text-ink-soft">
        Pokušajte ponovo za nekoliko trenutaka. Ako se problem ponavlja, javite nam se putem stranice za kontakt.
      </p>
      <button type="button" onClick={reset} className="btn btn-primary">
        Pokušaj ponovo
      </button>
    </div>
  );
}
