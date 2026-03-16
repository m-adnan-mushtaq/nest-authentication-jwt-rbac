import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CacheService,
  DEFAULT_CACHE_TTL,
} from '../../../../shared/cache/cache.service';
import { CacheHelper } from '../../../../utils/cache.helper';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
    private cacheService: CacheService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
      passReqToCallback: false,
    });
  }

  async validate(payload: any) {
    const userId = payload.sub;
    const cacheKey = CacheHelper.getUserCacheKey(userId);
    let user = await this.cacheService.get<User>(cacheKey);

    if (!user) {
      user = await this.userRepository.findOne({
        where: { id: userId },
        relations: { role: true },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      user.activeRole = user.role?.name ?? null;
      await this.cacheService.set(cacheKey, user, DEFAULT_CACHE_TTL);
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Email is not verified');
    }

    delete (user as any).password;
    delete (user as any).mfaSecret;
    (user as any).meta = payload.meta;

    return user;
  }
}
