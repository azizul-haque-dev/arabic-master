import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { GoogleProfilePayload } from '../services/oauth.service.js';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(configService: ConfigService) {
        const clientID = configService.get<string>('auth.google.clientId');
        const clientSecret = configService.get<string>('auth.google.clientSecret');
        const callbackURL = configService.get<string>('auth.google.callbackUrl');

        // Defensive check to catch configuration issues at boot time
        if (!clientID || !clientSecret || !callbackURL) {
            throw new Error('Missing Google OAuth configuration credentials.');
        }

        super({
            clientID,
            clientSecret,
            callbackURL,
            scope: ['email', 'profile'],
        });
    }

    validate(
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
    ): void {
        const email = profile.emails?.[0]?.value;
        // Replace the old emailVerified line with this:
        const emailVerified = profile.emails?.[0]?.verified === true;


        if (!email) {
            return done(new Error('Google profile did not include an email address'), false);
        }

        const payload: GoogleProfilePayload = {
            providerAccountId: profile.id,
            email: email.toLowerCase(),
            emailVerified,
            firstName: profile.name?.givenName ?? profile.displayName ?? 'Google',
            lastName: profile.name?.familyName ?? 'User',
        };

        done(null, payload);
    }
}
