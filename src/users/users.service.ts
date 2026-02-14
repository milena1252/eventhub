import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {}

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepo.findOne({ where: { email } });
    }

    async findById(id: string): Promise<User> {
        const user = await this.userRepo.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async findAll(): Promise<User[]> {
        return this.userRepo.find({
            order: { createdAt: 'DESC' },
        });
    }

    async create(email: string, passwordHash: string): Promise<User> {
        const existing = await this.findByEmail(email);

        if (existing) {
            throw new ConflictException('User already exists');
        }

        const user = this.userRepo.create({ email, passwordHash });
        return this.userRepo.save(user);
    }
}
