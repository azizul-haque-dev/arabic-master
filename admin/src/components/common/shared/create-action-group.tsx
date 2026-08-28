import { Button } from "@/components/ui/button";
import { GenerateAiDialog } from "@/features/arabic-texts/generate-ai-dialog";
import { Plus } from "lucide-react";

interface CreateActionGroupProps {
  apiPath: string;
  onCreate: () => void;
  buttonLabel: string;
  className?: string;
}

export const CreateActionGroup = ({
  apiPath,
  onCreate,
  buttonLabel,
  className = "flex gap-2",
}: CreateActionGroupProps) => {
  return (
    <div className={className}>
      <GenerateAiDialog apiPath={apiPath} />
      <Button onClick={onCreate}>
        <Plus className="h-4 w-4" />
        {buttonLabel}
      </Button>
    </div>
  );
};
