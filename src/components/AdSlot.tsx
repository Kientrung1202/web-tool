export function AdSlot({ label }: { label: string }) {
  return (
    <aside className="mt-5 grid min-h-24 place-items-center rounded-lg border border-dashed bg-transparent text-sm text-muted-foreground" aria-label={label}>
      {label}
    </aside>
  );
}
