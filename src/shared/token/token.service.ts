import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from '../../entities/token.entity';
import * as moment from 'moment';
import { ConfigService } from '@nestjs/config';
import { TokenTypes } from '@/common/enums';
import { User } from '@/entities/user.entity';

type Payload = Record<string, any>;

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  async generateToken(
    userId: string,
    expires: moment.Moment,
    type: string,
    meta?: Record<string, any>,
  ): Promise<string> {
    const payload: Payload = {
      sub: userId,
      type,
      ...(meta && { meta }),
    };

    const expiresIn = expires.diff(moment(), 'seconds');

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn,
    });
  }

  async saveToken(
    payload: Pick<Token, 'token' | 'type' | 'blacklisted' | 'expires'> & {
      userId: string;
    },
  ): Promise<Token> {
    const { token, userId, blacklisted, expires, type } = payload;
    const tokenEntity = this.tokenRepository.create({
      token,
      user: { id: userId } as User,
      blacklisted,
      expires,
      type,
    });
    return this.tokenRepository.save(tokenEntity);
  }

  async verifyToken(payload: Pick<Token, 'token' | 'type'>): Promise<Token> {
    try {
      const { token, type } = payload;
      const jwtPayload = await this.jwtService.verifyAsync(token, {
        ignoreExpiration: false,
        secret: process.env.JWT_SECRET,
      });

      const tokenDoc = await this.tokenRepository.findOne({
        where: {
          token,
          type,
          user: { id: jwtPayload.sub },
          blacklisted: false,
        },
        relations: ['user'],
      });

      if (!tokenDoc) {
        throw new NotFoundException('Token not found');
      }

      return tokenDoc;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Token expired');
      }
      throw error;
    }
  }

  async generateAccessTokens(user: User) {
    const accessTokenExpires = moment().add(
      parseInt(
        this.config.get<string>('JWT_ACCESS_EXPIRATION_MINUTES') || '60',
      ),
      'minutes',
    );

    const accessToken = await this.generateToken(
      user.id,
      accessTokenExpires,
      'ACCESS',
      {
        activeRole: user.activeRole || null,
      },
    );

    return {
      access: {
        token: accessToken,
        expires: accessTokenExpires.toDate(),
      },
    };
  }

  async generateResetPasswordToken(userId: string): Promise<string> {
    const expires = moment().add(
      parseInt(
        this.config.get<string>('JWT_RESET_PASSWORD_EXPIRATION_MINUTES') ||
          '10',
      ),
      'minutes',
    );
    const resetPasswordToken = await this.generateToken(
      userId,
      expires,
      TokenTypes.RESET_PASSWORD,
    );
    await this.saveToken({
      token: resetPasswordToken,
      userId,
      blacklisted: false,
      expires: expires.toDate(),
      type: TokenTypes.RESET_PASSWORD,
    });
    return resetPasswordToken;
  }

  async generateVerifyEmailToken(userId: string): Promise<string> {
    const expires = moment().add(
      parseInt(
        this.config.get<string>('JWT_VERIFY_EMAIL_EXPIRATION_MINUTES') || '10',
      ),
      'minutes',
    );
    const verifyEmailToken = await this.generateToken(
      userId,
      expires,
      TokenTypes.VERIFY_EMAIL,
    );
    await this.saveToken({
      token: verifyEmailToken,
      userId,
      blacklisted: false,
      expires: expires.toDate(),
      type: TokenTypes.VERIFY_EMAIL,
    });
    return verifyEmailToken;
  }

  async deleteToken(payload: Pick<Token, 'user' | 'type'>) {
    await this.tokenRepository.delete({
      user: payload.user,
      type: payload.type,
    });
  }
}
