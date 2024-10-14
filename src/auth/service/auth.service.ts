import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from '../repository/users.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from '../dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interface/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    try {
      return this.usersRepository.createUser(authCredentialsDto);
    } catch (error) {
      // Record duplication error code
      if (error.code === '23505') {
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    const { username, password } = authCredentialsDto;

    const user = await this.usersRepository.findOneBy({ username });
    const matchesPassword = await bcrypt.compare(password, user.password);

    if (user && matchesPassword) {
      const payload: JwtPayload = { username };
      const accessToken = this.jwtService.sign(payload);
      return { accessToken };
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }
}
