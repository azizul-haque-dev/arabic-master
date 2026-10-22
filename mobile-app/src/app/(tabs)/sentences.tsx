import { Redirect } from "expo-router";

/** Legacy route: Sentences now lives inside the Learn tab. */
export default function SentencesRedirect() {
  return (
    <Redirect href={{ pathname: "/learn", params: { section: "sentences" } }} />
  );
}
