// app/admin/layout.tsx
import { AdminShell } from "@/components/layout/admin-shell";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { role } = await getCurrentUser();

    return <AdminShell role={role}>{children}</AdminShell>;
}