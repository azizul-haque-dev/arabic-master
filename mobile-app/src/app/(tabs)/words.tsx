import { Redirect } from "expo-router";

/** Legacy route: Words now lives inside the Learn tab. */
export default function WordsRedirect() {
  return <Redirect href={{ pathname: "/learn", params: { section: "words" } }} />;
}
