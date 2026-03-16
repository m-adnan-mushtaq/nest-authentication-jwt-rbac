import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { User } from '../../entities/user.entity';
import { Account } from '../../entities/account.entity';
import { Token } from '../../entities/token.entity';
import { Role } from '../../entities/role.entity';

import { UserService } from './user/user.service';
import { AccountService } from './account/account.service';
import { AuthService } from './auth/auth.service';
import { IdentityService } from './identity.service';

import { UserController } from './user/user.controller';
import { AuthController } from './auth/auth.controller';
import { IdentityController } from './identity.controller';

import { JwtStrategy } from './auth/strategy/jwt.strategy';

import { RoleModule } from '../role/role.module';

const jwtFactory = {
  useFactory: async (config: ConfigService) => {
    return {
      global: true,
      secret: config.get<string>('JWT_SECRET'),
      signOptions: {
        expiresIn: config.get<string>('JWT_EXPIRES_IN'),
      },
    };
  },
  inject: [ConfigService],
};

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Account, Token, Role]),
    PassportModule,
    JwtModule.registerAsync(jwtFactory),
    RoleModule,
  ],
  controllers: [AuthController, UserController, IdentityController],
  providers: [
    UserService,
    AccountService,
    AuthService,
    IdentityService,
    JwtStrategy,
  ],
  exports: [
    UserService,
    AccountService,
    AuthService,
    IdentityService,
    JwtModule,
  ],
})
export class IdentityModule {}
