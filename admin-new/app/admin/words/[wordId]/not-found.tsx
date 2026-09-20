import Link from "next/link";
import { Search } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <EmptyState
      icon={Search}
      title="Word not found"
      description="This word doesn't exist or may have been deleted."
      action={
        <Link href="/words">
          <Button variant="secondary">Back to Words</Button>
        </Link>
      }
    />
  );
}
