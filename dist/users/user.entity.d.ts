export declare enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN"
}
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    createdAt: Date;
}
