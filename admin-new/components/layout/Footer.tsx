import { footerColumns } from "@/lib/mock-data/landing";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-surface-container-low mt-space-3xl">
      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop py-space-3xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-space-2xl">
          <div className="space-y-space-sm">
            <div className="flex items-center gap-space-xs">
              <Sparkles className="h-7 w-7 text-primary" aria-hidden="true" />
              <span className="font-headline-md text-headline-md text-primary">
                Arabic Master
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              The authoritative spoken Arabic platform for ambitious
              professionals, diplomats, and linguists seeking native acoustic
              fluency.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="font-label-md text-label-md uppercase tracking-wider text-on-surface mb-space-md">
                {column.title}
              </h4>
              <ul className="space-y-space-xs">
                {column.links.map((link) => (
                  <li
                    key={link.label}
                    className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-space-2xl pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            © {new Date().getFullYear()} Arabic Master. All rights reserved.
          </p>
          <div className="flex items-center gap-space-lg">
            <span className="font-code-num text-code-num text-on-surface-variant">
              v2.8.4-academic
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Crafted for Spoken Precision
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
