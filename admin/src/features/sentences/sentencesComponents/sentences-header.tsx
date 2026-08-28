import { CreateActionGroup } from "@/components/common/shared/create-action-group";

const SentencesHeader = ({ openCreate }: { openCreate: () => void }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-ink">Sentences</h1>
        <p className="text-sm text-muted">
          Full example sentences built from your word bank.
        </p>
      </div>
      <CreateActionGroup
        apiPath="sentence"
        onCreate={openCreate}
        buttonLabel="New sentence"
      />
    </div>
  );
};

export default SentencesHeader;
