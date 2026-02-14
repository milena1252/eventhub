import { Event } from "../events/event.entity";
import { NotificationLog } from "../notifications/notification-log.entity";
import { Subscription } from "../subscriptions/subscription.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    passwordHash: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole;

    @CreateDateColumn()
    createdAt: Date;

    //relations
    @OneToMany(() => Event, (event) => event.creator)
    events: Event[];

    @OneToMany(() => Subscription, (sub) => sub.user)
    subscriptions: Subscription[];

    @OneToMany(() => NotificationLog, (log) => log.user)
    notificationLogs: NotificationLog[];
}




