import Link from "next/link";
import { Search } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <EmptyState
            icon={Search}
            title="Course not found"
            description="This course doesn't exist or may have been deleted."
            action={
                <Link href="/courses">
                    <Button variant="secondary">Back to Courses</Button>
                </Link>
            }
        />
    );
}