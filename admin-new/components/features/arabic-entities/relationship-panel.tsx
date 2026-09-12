import { Type, MessageSquareText, MessagesSquare } from "lucide-react";
import type { ArabicEntity } from "@/lib/types/content";

export function RelationshipPanel({ entity }: { entity: ArabicEntity }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <h3 className="font-heading text-sm font-semibold text-text">
        Where this is used
      </h3>
      <p className="mt-1 text-xs text-text-muted">
        Conversations reference sentences only — never this entity directly.
      </p>

      <div className="mt-5 flex flex-col items-center">
        <EntityNode arabic={entity.arabicText} label={entity.entityKey} />

        <div className="h-6 w-px bg-border-strong" aria-hidden="true" />

        <div className="flex w-full justify-center gap-3">
          <UsageNode icon={Type} label="Words" count={entity.wordUsageCount} />
          <UsageNode icon={MessageSquareText} label="Sentences" count={entity.sentenceUsageCount} />
        </div>

        {entity.conversationUsageCount > 0 ? (
          <>
            <div className="h-6 w-px bg-border-strong" aria-hidden="true" />
            <UsageNode
              icon={MessagesSquare}
              label="Conversations"
              count={entity.conversationUsageCount}
              hint="via sentences above"
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

function EntityNode({ arabic, label }: { arabic: string; label: string }) {
  return (
    <div className="rounded-md border border-primary/30 bg-primary-light/20 px-4 py-2.5 text-center">
      <p dir="rtl" lang="ar" className="font-arabic text-lg leading-relaxed text-text">
        {arabic}
      </p>
      <p className="text-[11px] font-medium text-primary-dark">{label}</p>
    </div>
  );
}

function UsageNode({
  icon: Icon,
  label,
  count,
  hint,
}: {
  icon: typeof Type;
  label: string;
  count: number;
  hint?: string;
}) {
  return (
    <div className="flex min-w-[92px] flex-col items-center gap-1 rounded-default border border-border px-3 py-2.5 text-center">
      <Icon className="h-4 w-4 text-secondary" aria-hidden="true" />
      <span className="font-heading text-lg font-bold leading-none text-text">
        {count}
      </span>
      <span className="text-[11px] text-text-muted">{label}</span>
      {hint ? <span className="text-[10px] text-text-muted/80">{hint}</span> : null}
    </div>
  );
}
