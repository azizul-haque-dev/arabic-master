import { Text } from "react-native";

type FormErrorProps = {
  message?: string | null;
};

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return <Text className="mt-2 text-sm text-error">{message}</Text>;
}
