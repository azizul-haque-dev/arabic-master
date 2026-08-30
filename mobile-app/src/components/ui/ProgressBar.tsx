import { View } from "react-native";

interface ProgressBarProps {
  value: number;
  trackClassName?: string;
  fillClassName?: string;
  heightClassName?: string;
}

export function ProgressBar({
  value,
  trackClassName = "bg-slate-100",
  fillClassName = "bg-primary",
  heightClassName = "h-2",
}: ProgressBarProps) {
  // Keep progress between 0 and 100
  const progress = Math.min(100, Math.max(0, value));

  return (
    <View
      className={`w-full overflow-hidden rounded-full ${heightClassName} ${trackClassName}`}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: progress,
      }}
    >
      <View
        className={`h-full rounded-full ${fillClassName}`}
        style={{
          width: `${progress}%`,
        }}
      />
    </View>
  );
}
