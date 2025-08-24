import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
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

  async AccessToken(user: User) {
    const payload = { user_id: user.user_id, login_id: user.login_id };
    const accessToken = await this.jwtService.signAsync(payload);
    return { 
      accessToken, 
      user: { 
        user_id: user.user_id, 
        login_id: user.login_id,
        nickname: user.nickname 
      } 
    };
  }

  async signup(dto: SignupDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const entity = this.userRepo.create({
      login_id: dto.login_id,
      password: passwordHash,
      nickname: dto.nickname,
    });
    const user = await this.userRepo.save(entity);
    return this.AccessToken(user);
  }

  async login(creds: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { login_id: creds.login_id },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(creds.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.AccessToken(user);
  }
}
