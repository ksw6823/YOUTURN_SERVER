import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { SignupDto } from './dtos/signup.dto';
import { CredentialsDto } from './dtos/credentials.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 로그인: 전달받은 사용자 프로필과 함께 토큰 발급 (데모용, 비밀번호 검증 제외)
  @Post('login')
  @HttpCode(200)
  async login(@Body() creds: CredentialsDto) {
    const { accessToken, refreshToken, user } = await this.authService.login(creds);
    return { accessToken, refreshToken, user };
  }

  @Post('signup')
  @HttpCode(201)
  async signup(@Body() dto: SignupDto) {
    const { accessToken, refreshToken, user } = await this.authService.signup(dto);
    return { accessToken, refreshToken, user };
  }

  // 예시: 보호된 라우트 확인용
  @Post('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  me() {
    return { ok: true };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() body: { refreshToken: string }) {
    const tokens = await this.authService.refresh(body.refreshToken);
    return tokens;
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Body() body: { login_id: string }) {
    await this.authService.logout(body.login_id);
    return { ok: true };
  }
}


