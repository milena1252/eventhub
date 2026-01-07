import { User } from './user.entity';
import { Repository } from 'typeorm';
export declare class UsersService {
    private readonly userRepo;
    constructor(userRepo: Repository<User>);
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User>;
    findAll(): Promise<User[]>;
    create(email: string, passwordHash: string): Promise<User>;
}
