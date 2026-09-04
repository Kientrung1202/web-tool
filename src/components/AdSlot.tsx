export function AdSlot({ label }: { label: string }) {
  return (
    <aside
      className="fixed inset-x-4 bottom-4 z-30 mx-auto grid min-h-20 max-w-6xl place-items-center rounded-lg border border-dashed bg-background/95 text-sm font-medium text-muted-foreground shadow-product backdrop-blur"
      aria-label={label}
    >
      {label}
    </aside>
  );
}
