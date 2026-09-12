import type { ArabicEntity } from "@/lib/types/content";

export function RelationshipSummary({ entity }: { entity: ArabicEntity }) {
  const parts: string[] = [];
  if (entity.wordUsageCount > 0) parts.push(`${entity.wordUsageCount} Word${entity.wordUsageCount > 1 ? "s" : ""}`);
  if (entity.sentenceUsageCount > 0)
    parts.push(`${entity.sentenceUsageCount} Sentence${entity.sentenceUsageCount > 1 ? "s" : ""}`);

  if (parts.length === 0) {
    return <span className="text-xs text-text-muted">Not used yet</span>;
  }

  return <span className="text-xs text-text-muted">{parts.join(" · ")}</span>;
}
