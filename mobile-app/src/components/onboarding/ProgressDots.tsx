import { View } from "react-native";

type ProgressDotsProps = {
  step: number;
  total: number;
};

export function ProgressDots({ step, total }: ProgressDotsProps) {
  return (
    <View
      className="flex-row items-center justify-center gap-2"
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${step} of ${total}`}
      accessibilityValue={{ min: 1, max: total, now: step }}
    >
      {Array.from({ length: total }, (_, index) => {
        const position = index + 1;
        const isCurrent = position === step;
        const isComplete = position < step;

        return (
          <View
            key={position}
            className={`rounded-full ${
              isCurrent
                ? "h-2.5 w-6 bg-primary"
                : isComplete
                  ? "h-2 w-2 bg-primary opacity-40"
                  : "h-2 w-2 bg-outline-variant"
            }`}
            accessible={false}
          />
        );
      })}
    </View>
  );
}

