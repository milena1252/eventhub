import { Event } from "../events/event.entity";
import { User } from "../users/user.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum NotificationStatus {
    PENDING = 'pending',
    SENT = 'sent',
    FAILED = 'failed',
}

export enum NotificationChannel {
    EMAIL = 'email',
    TELEGRAM = 'telegram',
}

export enum NotificationType {
    EVENT_UPDATED = 'EVENT_UPDATED',
    EVENT_CANCELLED = 'EVENT_CANCELLED',
    EVENT_DEACTIVATED = 'EVENT_DEACTIVATED',
    EVENT_REACTIVATED = 'EVENT_REACTIVATED',
}

@Entity('notification_log')
@Index(['eventId'])
@Index(['userId'])
@Index(['status'])
@Index(['channel'])
@Index(['createdAt'])
export class NotificationLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    eventId: string;

    @Column()
    userId: string;
     
    @ManyToOne(() => Event, (event) => event.notificationLogs, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'eventId' })
    event: Event;

    @ManyToOne(() => User, (user) => user.notificationLogs, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;    

    @Column({ nullable: true })
    message?: string;

    @Column({
        type: 'enum',
        enum: NotificationType,
    })
    type: NotificationType;
    
    @Column({
        type: 'enum',
        enum: NotificationChannel,
    })
    channel: NotificationChannel;

    @Column({
        type: 'enum',
        enum: NotificationStatus,
        default: NotificationStatus.PENDING,
    })
    status: NotificationStatus;

    @Column({ nullable: true })
    error?: string;

    @CreateDateColumn()
    createdAt: Date;
}