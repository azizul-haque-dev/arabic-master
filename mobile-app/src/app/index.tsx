import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import "../../global.css";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text className="text-green-500 text-bold">
        Edit src/app/index.tsx to edit this screen.
      </Text>
      <Link href="/(auth)/login">Go to login </Link>
      <Link className="mt-5" href="/(onboarding)/language">
        Go to language{" "}
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
