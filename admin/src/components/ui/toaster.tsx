// Wraps sonner with our design tokens so toast styling matches the rest
// of the app instead of the library defaults.
import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "!bg-surface !border !border-border !text-ink !shadow-md",
          description: "!text-muted",
          actionButton: "!bg-accent !text-white",
          cancelButton: "!bg-background !text-ink",
        },
      }}
    />
  );
}
