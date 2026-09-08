import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/i18n/locales";
import { buildLocalizedPath } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Brand column */}
          <div>
            <Link
              href={buildLocalizedPath(locale)}
              className="inline-flex items-center gap-2 text-foreground"
            >
              <Image src="/logo.svg" alt="" width={20} height={20} className="size-5" />
              <span className="text-sm font-bold tracking-tight">Shining</span>
            </Link>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted-foreground">
              {t(locale, "footerTagline")}
            </p>
          </div>

          {/* Product links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t(locale, "footerSectionProduct")}
            </p>
            <nav className="mt-3 flex flex-col gap-2" aria-label="Product">
              <Link
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                href={buildLocalizedPath(locale)}
              >
                {t(locale, "navTools")}
              </Link>
              <Link
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                href={buildLocalizedPath(locale, "about")}
              >
                {t(locale, "navAbout")}
              </Link>
            </nav>
          </div>

          {/* Legal links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t(locale, "footerSectionLegal")}
            </p>
            <nav className="mt-3 flex flex-col gap-2" aria-label="Legal">
              <Link
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                href={buildLocalizedPath(locale, "privacy")}
              >
                {t(locale, "navPrivacy")}
              </Link>
              <Link
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                href={buildLocalizedPath(locale, "terms")}
              >
                {t(locale, "navTerms")}
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {t(locale, "siteName")}
        </div>
      </div>
    </footer>
  );
}
