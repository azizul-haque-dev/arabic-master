import { cn } from "@/lib/utils";

type AuthAlertVariant = "info" | "error";

const VARIANT_CLASS: Record<AuthAlertVariant, string> = {
  info: "border-border-strong bg-info-bg text-info-text",
  error: "border-error/30 bg-error-bg text-error-text",
};

export function AuthAlert({
  variant,
  children,
}: {
  variant: AuthAlertVariant;
  children: React.ReactNode;
}) {
  return (
    <p
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "mt-space-sm rounded-default border px-3 py-2 font-body-sm text-body-sm",
        VARIANT_CLASS[variant],
      )}
    >
      {children}
    </p>
  );
}