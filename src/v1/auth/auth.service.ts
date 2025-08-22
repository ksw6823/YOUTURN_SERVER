import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dtos/login.dto';
import { SignupDto } from './dtos/signup.dto';
import { CredentialsDto } from './dtos/credentials.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async issueAccessToken(user: User) {
    const payload = { id: user.id, login_id: user.login_id };
    const { accessToken, refreshToken } = await this.signTokens(payload);
    user.refresh_token_hash = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.save(user);
    return { accessToken, refreshToken, user: { id: user.id, login_id: user.login_id } };
  }

  private async signTokens(payload: Record<string, any>) {
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });
    return { accessToken, refreshToken };
  }

  async signup(dto: SignupDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const entity = this.userRepo.create({
      login_id: dto.login_id,
      password_hash: passwordHash,
      gender: dto.gender as any,
      name: dto.name,
      address: dto.address,
      occupation: dto.occupation,
      birth_date: new Date(dto.birth_date),
    });
    const user = await this.userRepo.save(entity);
    // Ensure external unique user_id is populated so downstream APIs can reference it
    if (!user.user_id) {
      user.user_id = user.id;
      await this.userRepo.save(user);
    }
    return this.issueAccessToken(user);
  }

  async login(creds: CredentialsDto) {
    const user = await this.userRepo.findOne({ where: { login_id: creds.login_id } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(creds.password, user.password_hash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.issueAccessToken(user);
  }

  async refresh(refreshToken: string) {
    const decoded: any = this.jwtService.decode(refreshToken);
    if (!decoded?.login_id) throw new UnauthorizedException();
    const user = await this.userRepo.findOne({ where: { login_id: decoded.login_id } });
    if (!user || !user.refresh_token_hash) throw new UnauthorizedException();
    const ok = await bcrypt.compare(refreshToken, user.refresh_token_hash);
    if (!ok) throw new UnauthorizedException();
    const payload = { id: user.id, login_id: user.login_id };
    const { accessToken, refreshToken: newRefreshToken } = await this.signTokens(payload);
    user.refresh_token_hash = await bcrypt.hash(newRefreshToken, 10);
    await this.userRepo.save(user);
    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(login_id: string) {
    const user = await this.userRepo.findOne({ where: { login_id } });
    if (!user) return;
    user.refresh_token_hash = null;
    await this.userRepo.save(user);
  }
}


