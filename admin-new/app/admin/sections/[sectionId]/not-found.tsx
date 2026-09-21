import Link from "next/link";
import { Search } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <EmptyState
            icon={Search}
            title="Section not found"
            description="This section doesn't exist or may have been deleted."
            action={
                <Link href="/sections">
                    <Button variant="secondary">Back to Sections</Button>
                </Link>
            }
        />
    );
}