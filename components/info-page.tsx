import { Breadcrumbs } from "./breadcrumbs";

export function InfoPage({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <>
      <Breadcrumbs items={[{ name: title }]} />
      <article className="prose-page pb-10 pt-4">
        <h1 className="text-[clamp(1.9rem,3vw+0.6rem,2.8rem)]">{title}</h1>
        {intro ? <p className="mt-3 text-lg text-ink-soft">{intro}</p> : null}
        <div className="mt-6">{children}</div>
      </article>
    </>
  );
}
