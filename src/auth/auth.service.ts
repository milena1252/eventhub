import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async register(email: string, password: string) {
        const existing = await this.userService.findByEmail(email);
        if (existing) {
            throw new ConflictException('User already exists');
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await this.userService.create(email, passwordHash);

        return this.signToken(user.id, user.email, user.role);
    }

    async login(email: string, password: string) {
        const user = await this.userService.findByEmail(email);
        if (!user) {
           throw new UnauthorizedException('Invalid credentials');
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.signToken(user.id, user.email, user.role);
    }

    private signToken(userId: string, email: string, role: string) {
        const payload = { sub: userId, email, role };

        return {
            accessToken: this.jwtService.sign(payload),
        };
    }
}
