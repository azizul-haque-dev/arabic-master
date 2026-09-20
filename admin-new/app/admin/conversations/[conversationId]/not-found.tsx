import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <EmptyState
      icon={Search}
      title="Conversation not found"
      description="This conversation doesn't exist or may have been deleted."
      action={
        <Link href="/conversations">
          <Button variant="secondary">Back to Conversations</Button>
        </Link>
      }
    />
  );
}
