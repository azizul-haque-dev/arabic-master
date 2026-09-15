
import { headers } from "next/headers";

export type AdminRole = "ADMIN" | "CONTENT_MANAGER";

export interface CurrentAdminUser {
    userId: string;
    role: AdminRole;
}

export async function getCurrentUser(): Promise<CurrentAdminUser> {
    const headersList = await headers();
    const role = headersList.get("x-user-role") as AdminRole | null;
    const userId = headersList.get("x-user-id");

    if (!role || !userId) {
        // মানে middleware বাইপাস হয়েছে অথবা এই function ভুল জায়গায় call হয়েছে।
        throw new Error(
            "getCurrentUser() must only be called inside a route protected by middleware.",
        );
    }

    return { userId, role };
}