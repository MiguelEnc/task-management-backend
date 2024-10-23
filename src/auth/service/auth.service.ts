import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
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
  private logger = new Logger('AuthService');

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
        this.logger.error(`SignUp error. Username "${authCredentialsDto.username}" already exists.`)
        throw new ConflictException('Username already exists');
      } else {
        this.logger.error(`SignUp error for username "${authCredentialsDto.username}".`, error?.stack);
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
      this.logger.log(`User ${username} signed in succesfully`);
      const payload: JwtPayload = { username };
      const accessToken = this.jwtService.sign(payload);
      return { accessToken };
    } else {
      this.logger.warn(`Sign In attempt error for user ${username}.`);
      throw new UnauthorizedException('Please check your login credentials');
    }
  }
}
