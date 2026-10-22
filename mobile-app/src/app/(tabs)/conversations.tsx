import { Redirect } from "expo-router";

/** Legacy route: Conversations now lives inside the Learn tab. */
export default function ConversationsRedirect() {
  return (
    <Redirect
      href={{ pathname: "/learn", params: { section: "conversations" } }}
    />
  );
}
