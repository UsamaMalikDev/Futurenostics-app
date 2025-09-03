import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { UserRole } from 'src/users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await this.usersService.validatePassword(user, password))) {
      const { passwordHash, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user._id,
      roles: user.roles,
      orgId: user.orgId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>('jwt.accessTokenExpiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>('jwt.refreshTokenExpiresIn'),
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name || user.email.split('@')[0], // Fallback to email prefix if no name
        role: user.roles?.[0] || 'user', // Use first role or default to 'user'
        roles: user.roles,
        orgId: user.orgId,
      },
    };
  }

  async refreshToken(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload = {
      email: user.email,
      sub: user._id,
      roles: user.roles,
      orgId: user.orgId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>('jwt.accessTokenExpiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>('jwt.refreshTokenExpiresIn'),
      }),
    ]);

    return { 
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
  async register(body: any) {
    const { email, password, role, name } = body;
    return this.usersService.create(email, password, null, [role], name);
  }
}
