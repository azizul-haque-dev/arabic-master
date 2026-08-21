import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Fragment } from "react";

export interface Crumb {
  label: string;
  to?: string;
}

export function BreadcrumbNav({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm text-muted">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <Fragment key={i}>
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className="max-w-[40vw] truncate hover:text-ink hover:underline sm:max-w-xs"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`max-w-[40vw] truncate sm:max-w-xs ${isLast ? "font-medium text-ink" : ""}`}
              >
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-border" />}
          </Fragment>
        );
      })}
    </nav>
  );
}
