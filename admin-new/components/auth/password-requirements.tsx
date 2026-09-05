import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { passwordRules } from "@/lib/validations/auth";

interface PasswordRequirementsProps {
  password: string;
}

const rules = [
  {
    label: "At least 8 characters",
    test: (value: string) => value.length >= passwordRules.minLength,
  },
  {
    label: "At least one special character",
    test: (value: string) => passwordRules.specialChar.test(value),
  },
];

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  return (
    <ul className="space-y-1.5 rounded-lg bg-(--am-paper) px-3 py-2.5">
      {rules.map((rule) => {
        const passed = rule.test(password);
        return (
          <li key={rule.label} className="flex items-center gap-2 text-sm">
            <span
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                passed
                  ? "bg-(--am-moss) text-white"
                  : "border border-(--am-line) bg-white text-transparent",
              )}
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span
              className={passed ? "text-(--am-ink)" : "text-(--am-text-muted)"}
            >
              {rule.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
