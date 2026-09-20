import Link from "next/link";
import { Search } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <EmptyState
            icon={Search}
            title="Sentence not found"
            description="This sentence doesn't exist or may have been deleted."
            action={
                <Link href="/sentences">
                    <Button variant="secondary">Back to Sentences</Button>
                </Link>
            }
        />
    );
}