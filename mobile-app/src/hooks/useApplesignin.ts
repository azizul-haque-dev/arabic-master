import * as AppleAuthentication from "expo-apple-authentication";

export function useAppleSignIn() {
  const signInWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      // TODO: credential.identityToken ব্যাকএন্ডে পাঠিয়ে verify করুন এবং session set করুন
      return credential;
    } catch (err: any) {
      // ব্যবহারকারী নিজে cancel করলে এটা error হিসেবে দেখানোর দরকার নেই
      if (err?.code !== "ERR_REQUEST_CANCELED") {
        console.error("Apple sign-in failed", err);
      }
      return null;
    }
  };

  return { signInWithApple };
}
