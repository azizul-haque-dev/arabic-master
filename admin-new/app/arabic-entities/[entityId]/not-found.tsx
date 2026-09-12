import Link from "next/link";
import { Search } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <EmptyState
      icon={Search}
      title="Entity not found"
      description="This Arabic entity doesn't exist or may have been deleted."
      action={
        <Link href="/arabic-entities">
          <Button variant="secondary">Back to Arabic Entities</Button>
        </Link>
      }
    />
  );
}
