import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { AuthCredentialsDto } from '../dto/auth-credentials.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  createUser(@Body() authCredentials: AuthCredentialsDto): Promise<void> {
    return this.authService.signUp(authCredentials);
  }

  @Post('/signin')
  signIn(
    @Body() authCredentials: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(authCredentials);
  }
}
