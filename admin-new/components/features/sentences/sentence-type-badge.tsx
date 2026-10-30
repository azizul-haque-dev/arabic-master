import { Badge } from "@/components/ui/badge";
import { SENTENCE_TYPE_LABEL, type SentenceType } from "@/lib/types/content";
import { cn } from "@/lib/utils";

export function SentenceTypeBadge({
    type,
    className,
}: {
    type: SentenceType;
    className?: string;
}) {
    const isShort = type === "SHORT";

    return (
        <Badge
            className={cn(
                isShort
                    ? "bg-primary-light/20 text-primary-dark"
                    : "bg-secondary/10 text-secondary",
                className,
            )}
        >
            {SENTENCE_TYPE_LABEL[type]}
        </Badge>
    );
}

