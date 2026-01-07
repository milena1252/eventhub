import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
export declare class AuthService {
    private readonly userService;
    private readonly jwtService;
    constructor(userService: UsersService, jwtService: JwtService);
    register(email: string, password: string): Promise<{
        accessToken: string;
    }>;
    login(email: string, password: string): Promise<{
        accessToken: string;
    }>;
    private signToken;
}
