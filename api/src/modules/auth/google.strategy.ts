import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from '../../config/env.js';
import type { GoogleProfilePayload } from './oauth.service.js';

export function registerGoogleStrategy(): void {
  passport.use(
    new GoogleStrategy(
      { clientID: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET, callbackURL: env.GOOGLE_CALLBACK_URL },
      (_at, _rt, profile, done) => {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('Google profile did not include an email address'), false);

        const payload: GoogleProfilePayload = {
          providerAccountId: profile.id,
          email: email.toLowerCase(),
          emailVerified: profile.emails?.[0]?.verified === true,
          fullName:
            profile.displayName ||
            `${profile.name?.givenName ?? ''} ${profile.name?.familyName ?? ''}`.trim() ||
            'Google User',
        };
        done(null, payload as unknown as Express.User);
      },
    ),
  );
}
