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
                    ? "border border-primary-light/20 bg-primary-light/10 text-primary-light"
                    : "border border-primary/25 bg-primary/15 text-[#c9c6ff]",
                className,
            )}
        >
            {SENTENCE_TYPE_LABEL[type]}
        </Badge>
    );
}

