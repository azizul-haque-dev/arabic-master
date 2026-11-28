import Link from "next/link";

export function BrandLogo() {
  return (
    <Link
      href="/"
      className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center text-primary"
        aria-hidden="true"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 6.2C10.1 4.9 7.6 4.4 5.1 4.7C4.2 4.8 3.5 5.5 3.5 6.4V17.2C3.5 18.2 4.4 18.9 5.4 18.8C7.7 18.5 10.1 19 12 20.3C13.9 19 16.3 18.5 18.6 18.8C19.6 18.9 20.5 18.2 20.5 17.2V6.4C20.5 5.5 19.8 4.8 18.9 4.7C16.4 4.4 13.9 4.9 12 6.2Z"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 6.2V20.2"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
          <path
            d="M6.8 9.2C8.1 9 9.3 9.2 10.2 9.7"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M17.2 9.2C15.9 9 14.7 9.2 13.8 9.7"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block truncate font-heading text-lg font-semibold leading-none text-text">
          Arabic Master
        </span>
        <span className="mt-1 block text-xs font-medium text-text-muted">
          Spoken Arabic
        </span>
      </span>
    </Link>
  );
}
