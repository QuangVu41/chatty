import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/providers/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtProvider } from './jwt.provider';
import { Request, Response } from 'express';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtProvider: JwtProvider,
  ) {}

  async signup(user: CreateUserDto, res: Response) {
    const { email, password, fullName } = user;

    try {
      const user = await this.usersService.findOne({ email });

      if (user) throw new BadRequestException('Email already exists');

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await this.usersService.create({
        email,
        fullName,
        password: hashedPassword,
      });

      this.jwtProvider.generateToken(newUser._id.toString(), res);

      return {
        _id: newUser._id,
        email,
        fullName,
        createdAt: newUser.createdAt,
      };
    } catch (error) {
      this.logger.error('Error during signup', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException();
    }
  }

  async login(loginDto: LoginDto, res: Response) {
    const { email, password } = loginDto;

    try {
      const user = await this.usersService.findOne({ email });

      if (!user) throw new BadRequestException('Invalid credentials');

      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (!isPasswordCorrect)
        throw new BadRequestException('Invalid credentials');

      this.jwtProvider.generateToken(user._id.toString(), res);

      return {
        _id: user._id,
        email,
        fullName: user.fullName,
        profilePic: user.profilePic,
        createdAt: user.createdAt,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException();
    }
  }

  logout(res: Response) {
    res.cookie('jwt', '', { maxAge: 0 });

    return { message: 'Logged out successfully' };
  }

  checkAuth(req: Request) {
    return req.user;
  }
}
