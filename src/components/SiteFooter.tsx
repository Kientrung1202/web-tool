import Link from "next/link";
import type { Locale } from "@/i18n/locales";
import { buildLocalizedPath } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <span>{t(locale, "siteName")}</span>
        <Link className="transition hover:text-foreground" href={buildLocalizedPath(locale, "privacy")}>{t(locale, "navPrivacy")}</Link>
      </div>
    </footer>
  );
}
