import { Label } from "@/components/ui/label";
import type { ReactNode } from "react";
import type { FieldError } from "react-hook-form";

interface AuthFieldProps {
  id: string;
  label: string;
  error?: FieldError;
  children: ReactNode;
}

export function AuthField({
  id,
  label,
  error,
  children,
}: AuthFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      {children}
      {error ? (
        <p
          id={errorId}
          className="mt-1.5 font-body-sm text-body-sm text-error-text"
        >
          {error.message}
        </p>
      ) : null}
    </div>
  );
}