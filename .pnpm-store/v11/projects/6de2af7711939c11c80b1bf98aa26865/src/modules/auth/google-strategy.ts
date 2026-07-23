// Configures Passport's Google OAuth2 strategy. Only wired up if Google
// credentials are present in the environment, so local-only deployments
// don't need to configure OAuth at all.
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { findOrCreateGoogleUser } from "./auth.service.js";

export function configureGoogleStrategy(): void {
  if (
    !env.GOOGLE_CLIENT_ID ||
    !env.GOOGLE_CLIENT_SECRET ||
    !env.GOOGLE_CALLBACK_URL
  ) {
    logger.warn(
      "Google OAuth credentials not set - /auth/google routes are disabled",
    );
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error("Google account has no email"));

          const result = await findOrCreateGoogleUser({
            googleId: profile.id,
            email,
            name: profile.displayName,
            avatarUrl: profile.photos?.[0]?.value,
          });

          done(null, result.user);
        } catch (err) {
          done(err as Error);
        }
      },
    ),
  );
}
