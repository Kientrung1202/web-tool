import Link from "next/link";

export default function RootPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-8">
      <section className="w-full max-w-lg rounded-lg border bg-card p-8 text-center shadow-product">
        <p className="mx-auto mb-5 inline-flex h-9 min-w-12 items-center justify-center rounded-md bg-primary px-3 text-sm font-bold text-primary-foreground">
          PDF
        </p>
        <h1 className="text-4xl font-bold tracking-normal text-card-foreground md:text-5xl">Free PDF Tools</h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-muted-foreground">Choose your language to continue.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            href="/en"
          >
            English
          </Link>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md border bg-card px-5 text-sm font-semibold text-foreground transition hover:bg-accent hover:text-accent-foreground"
            href="/vi"
          >
            Tiếng Việt
          </Link>
        </div>
      </section>
    </main>
  );
}
