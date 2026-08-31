import { ActivityIndicator, Pressable, Text } from "react-native";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
};

export function PrimaryButton({ label, onPress, loading }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      className="mt-2 h-14 items-center justify-center rounded-lg bg-primary shadow-md active:opacity-90 disabled:opacity-60"
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text className="font-label-md text-label-md text-on-primary">
          {label}
        </Text>
      )}
    </Pressable>
  );
}
