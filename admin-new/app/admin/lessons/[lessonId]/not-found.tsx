import Link from "next/link";
import { Search } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <EmptyState
            icon={Search}
            title="Lesson not found"
            description="This lesson doesn't exist or may have been deleted."
            action={
                <Link href="/lessons">
                    <Button variant="secondary">Back to Lessons</Button>
                </Link>
            }
        />
    );
}