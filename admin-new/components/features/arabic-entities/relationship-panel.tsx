import { Type, MessageSquareText, MessagesSquare } from "lucide-react";
import Link from "next/link";
import type {
  ArabicEntity,
  ArabicEntitySentenceReference,
  ArabicEntityWordReference,
} from "@/lib/types/content";

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

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <RelatedContentList
          label="Words"
          count={entity.wordUsageCount}
          items={entity.linkedWords}
          path="/admin/words"
        />
        <RelatedContentList
          label="Sentences"
          count={entity.sentenceUsageCount}
          items={entity.linkedSentences}
          path="/admin/sentences"
        />
      </div>
    </div>
  );
}

function RelatedContentList({
  label,
  count,
  items,
  path,
}: {
  label: string;
  count: number;
  items: ArabicEntityWordReference[] | ArabicEntitySentenceReference[] | undefined;
  path: string;
}) {
  return (
    <section className="rounded-md border border-border p-3">
      <h4 className="text-xs font-semibold text-text">
        {label} ({count})
      </h4>
      {items === undefined ? (
        <p className="mt-2 text-xs text-text-muted">
          {count > 0 ? `Unable to load linked ${label.toLowerCase()}.` : `No linked ${label.toLowerCase()}.`}
        </p>
      ) : items.length > 0 ? (
        <ul className="mt-2 flex flex-col gap-1">
          {items.map((item) => {
            const key = "wordKey" in item ? item.wordKey : item.sentenceKey;
            const sentenceType = "sentenceType" in item ? item.sentenceType : undefined;
            return (
              <li key={item.id}>
                <Link
                  href={`${path}/${encodeURIComponent(item.id)}`}
                  className="flex flex-col rounded-sm px-2 py-1.5 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="text-xs font-medium text-primary">
                    {key}{sentenceType === "SHORT" ? " · Short sentence" : ""}
                  </span>
                  <span className="truncate text-xs text-text-muted">
                    {item.meaningEnglish || "No English meaning"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-text-muted">No linked {label.toLowerCase()}.</p>
      )}
    </section>
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
