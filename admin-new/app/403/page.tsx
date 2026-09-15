
import Link from "next/link";
import { ShieldAlert } from "lucide-react"

export default function ForbiddenPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
            <ShieldAlert className="h-10 w-10 text-error-text" aria-hidden="true" />
            <h1 className="font-heading text-xl font-semibold text-text">
                Access denied
            </h1>
            <p className="max-w-sm text-sm text-text-secondary">
                তোমার account-এর এই পেজ দেখার permission নেই।
            </p>
            <Link href="/" className="text-sm font-medium text-primary hover:underline">
                Home-এ ফিরে যাও
            </Link>
        </div>
    );
}

