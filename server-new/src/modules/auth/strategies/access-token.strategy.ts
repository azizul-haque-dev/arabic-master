import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RedisService } from '../../../database/redis/redis.service.js';
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
    private readonly usersService: UsersService,
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

    const revoked = await this.redis.isSessionRevoked(payload.sessionId);
    if (revoked) {
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
