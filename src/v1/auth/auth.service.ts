import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dtos/login.dto';
import { CredentialsDto } from './dtos/credentials.dto';
import { SignupDto } from './dtos/signup.dto';
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

  async issueAccessToken(userProfile: LoginDto) {
    const payload = {
      user_id: userProfile.user_id,
      name: userProfile.name,
      gender: userProfile.gender,
      address: userProfile.address,
      occupation: userProfile.occupation,
      birth_date: userProfile.birth_date,
      funds: userProfile.funds,
      family_member: userProfile.family_member,
      preferred_crop: userProfile.preferred_crop,
      preferred_area: userProfile.preferred_area,
      move_period: userProfile.move_period,
      farming_experience: userProfile.farming_experience,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    return {
      accessToken,
      user: userProfile,
    };
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
      name: dto.name,
      gender: dto.gender as any,
      address: dto.address,
      occupation: dto.occupation,
      birth_date: new Date(dto.birth_date),
      funds: dto.funds,
      family_member: dto.family_member,
      preferred_crop: dto.preferred_crop,
      preferred_area: dto.preferred_area,
      move_period: new Date(dto.move_period),
      farming_experience: dto.farming_experience,
      login_id: dto.login_id,
      password_hash: passwordHash,
    });
    const user = await this.userRepo.save(entity);

    const payload = {
      user_id: user.user_id,
      name: user.name,
      gender: user.gender,
      address: user.address,
      occupation: user.occupation,
      birth_date: user.birth_date,
      funds: user.funds,
      family_member: user.family_member,
      preferred_crop: user.preferred_crop,
      preferred_area: user.preferred_area,
      move_period: user.move_period,
      farming_experience: user.farming_experience,
      login_id: user.login_id,
    };
    const { accessToken, refreshToken } = await this.signTokens(payload);
    user.refresh_token_hash = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.save(user);
    return { accessToken, refreshToken, user: payload };
  }

  async login(creds: CredentialsDto) {
    const user = await this.userRepo.findOne({ where: { login_id: creds.login_id } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(creds.password, user.password_hash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const payload = {
      user_id: user.user_id,
      name: user.name,
      gender: user.gender,
      address: user.address,
      occupation: user.occupation,
      birth_date: user.birth_date,
      funds: user.funds,
      family_member: user.family_member,
      preferred_crop: user.preferred_crop,
      preferred_area: user.preferred_area,
      move_period: user.move_period,
      farming_experience: user.farming_experience,
      login_id: user.login_id,
    };
    const { accessToken, refreshToken } = await this.signTokens(payload);
    user.refresh_token_hash = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.save(user);
    return { accessToken, refreshToken, user: payload };
  }

  async refresh(refreshToken: string) {
    const decoded: any = this.jwtService.decode(refreshToken);
    if (!decoded?.login_id) throw new UnauthorizedException();
    const user = await this.userRepo.findOne({ where: { login_id: decoded.login_id } });
    if (!user || !user.refresh_token_hash) throw new UnauthorizedException();
    const ok = await bcrypt.compare(refreshToken, user.refresh_token_hash);
    if (!ok) throw new UnauthorizedException();

    const payload = {
      user_id: user.user_id,
      name: user.name,
      gender: user.gender,
      address: user.address,
      occupation: user.occupation,
      birth_date: user.birth_date,
      funds: user.funds,
      family_member: user.family_member,
      preferred_crop: user.preferred_crop,
      preferred_area: user.preferred_area,
      move_period: user.move_period,
      farming_experience: user.farming_experience,
      login_id: user.login_id,
    };
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


