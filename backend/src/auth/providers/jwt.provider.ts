import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class JwtProvider {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateToken(userId: string, res: Response) {
    const token = this.jwtService.sign({ userId });

    const maxAge = +this.configService.getOrThrow<string>('JWT_EXPIRATION');

    const secure =
      this.configService.getOrThrow<string>('NODE_ENV') !== 'development';

    res.cookie('jwt', token, { maxAge, httpOnly: true, secure });

    return token;
  }
}
