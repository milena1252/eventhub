import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import type { RequestUser } from 'src/common/interfaces/request-with-user';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor (private readonly auth: AuthService) {}

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.auth.register(dto.email, dto.password);
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.auth.login(dto.email, dto.password);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@CurrentUser() user: RequestUser) {
        return user;
    }
}

//token
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxYmYwMGZlYS1jYWJkLTQxNTQtOGUyMC1hNThhMjRiZDMwMGQiLCJlbWFpbCI6InVzZXIxQHRlc3QuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3Njc4MTQwMTAsImV4cCI6MTc2NzgxNzYxMH0.NVTDbAQTbsydQ_ca3KMKS7nsdt0t38W9rt7Qe_pB90U
//event_id
//83d8c5b1-2649-41d8-930a-19fdf5b01740