import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex min-h-[60vh] w-full flex-col items-center justify-center overflow-hidden px-gutter-mobile py-space-2xl">
            <div
                className="pointer-events-none absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-primary-fixed/30 blur-3xl"
                aria-hidden="true"
            />
            <div className="relative z-10 w-full max-w-md">
                <Link href="/" className="mb-space-xl flex items-center justify-center gap-2.5">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light/35 text-primary-dark">
                        <Sparkles className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-left">
                        <span className="block font-headline-md text-headline-md leading-none tracking-tight text-on-surface">
                            Arabic Master
                        </span>
                        <span className="mt-1 block font-label-sm text-label-sm font-semibold uppercase tracking-[0.14em] text-primary">
                            Admin Console
                        </span>
                    </span>
                </Link>
                {children}
            </div>
        </div>
    );
}