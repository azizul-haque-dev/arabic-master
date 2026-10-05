import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { eq } from 'drizzle-orm';
import { PinoLogger } from 'nestjs-pino';
import { DatabaseService } from '../../../database/drizzle/db.service.js';
import { RedisService } from '../../../database/redis/redis.service.js';
import * as schema from '../../../database/drizzle/schema.js';
import { UsersService } from '../../users/users.service.js';
import { AccessTokenPayload, RequestUser } from '../types/jwt-payload.type.js';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(
    configService: ConfigService,
    private readonly redis: RedisService,
    private readonly db: DatabaseService,
    private readonly usersService: UsersService,
    private readonly logger: PinoLogger,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('auth.jwt.accessSecret') as string,
    });
  }

  async validate(payload: AccessTokenPayload): Promise<RequestUser> {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    let revoked = false;
    try {
      revoked = await this.redis.isSessionRevoked(payload.sessionId);
    } catch (error) {
      this.logger.warn(
        { err: error, sessionId: payload.sessionId },
        'Redis session revocation check failed; checking the database',
      );
    }
    if (revoked) {
      throw new UnauthorizedException('Session has been revoked');
    }

    const sessionRows = await this.db.db
      .select({
        isActive: schema.session.isActive,
        revokedAt: schema.session.revokedAt,
      })
      .from(schema.session)
      .where(eq(schema.session.id, payload.sessionId))
      .limit(1);
    const session = sessionRows[0];
    if (!session || !session.isActive || session.revokedAt) {
      throw new UnauthorizedException('Session has been revoked');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return {
      userId: payload.sub,
      sessionId: payload.sessionId,
      jwtId: payload.jwtId,
      role: user.role,
    };
  }
}
