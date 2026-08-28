import { StatusBadge } from "@/components/status-badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { ArabicTextEntry } from "@/types";

interface AIInfoDisplayProps {
  arabic: ArabicTextEntry;
}

export function AIInfoDisplay({ arabic }: AIInfoDisplayProps) {
  const hasAiInfo =
    arabic &&
    (arabic.meaningBn ||
      arabic.meaningEn ||
      arabic.feminineEn ||
      arabic.feminineBn);

  return (
    <>
      <Separator />
      <div className="space-y-2 rounded-md border border-border bg-background p-3 max-w-2xl">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wide text-muted">
            AI-generated info (read-only)
          </Label>
          <div className="flex gap-1.5">
            <StatusBadge status={arabic.status} />
            <StatusBadge status={arabic.aiStatus} />
          </div>
        </div>

        {hasAiInfo ? (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {arabic.meaningEn && (
              <p>
                <span className="text-muted">Meaning (EN): </span>
                {arabic.meaningEn}
              </p>
            )}
            {arabic.feminineBn && (
              <p>
                <span className="text-muted">Meaning (Bn): </span>
                {arabic.feminineBn}
              </p>
            )}
            {arabic.feminineEn && (
              <p>
                <span className="text-muted">Feminine (En): </span>
                {arabic.feminineEn}
              </p>
            )}
            {arabic.feminineBn && (
              <p>
                <span className="text-muted">Feminine (Bn): </span>
                {arabic.feminineBn}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">
            {arabic.aiStatus === "FAILED"
              ? `AI generation failed${
                  arabic.errorMessage ? `: ${arabic.errorMessage}` : "."
                }`
              : "Not generated yet."}
          </p>
        )}
      </div>
    </>
  );
}
