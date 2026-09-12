import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  word: "text-[32px] sm:text-[38px]",
  sentence: "text-[26px] sm:text-[30px]",
  small: "text-[20px] sm:text-[22px]",
} as const;

export function ArabicTextDisplay({
  text,
  size = "word",
  className,
}: {
  text: string;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}) {
  return (
    <p
      dir="rtl"
      lang="ar"
      className={cn(
        "font-arabic font-medium text-text",
        "leading-[1.9]", // never below 1.75 — Design.md §6
        SIZE_CLASS[size],
        className,
      )}
    >
      {text}
    </p>
  );
}
