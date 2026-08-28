import { Button } from "@/components/ui/button";
import { GenerateAiDialog } from "@/features/arabic-texts/generate-ai-dialog";
import { Plus } from "lucide-react";

interface WordsHeaderProps {
  onOpenCreate: () => void;
}

export function WordsHeader({ onOpenCreate }: WordsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-ink">Words</h1>
        <p className="text-sm text-muted">
          Individual Arabic vocabulary entries.
        </p>
      </div>
      <div className="flex gap-2">
        <GenerateAiDialog apiPath={"word"} />
        <Button onClick={onOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New word
        </Button>
      </div>
    </div>
  );
}
