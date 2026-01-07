import { UserRole } from "src/users/user.entity";
export interface RequestUser {
    id: string;
    email: string;
    role: UserRole;
}
