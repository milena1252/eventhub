import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

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

@Entity()
export class NotificationLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    eventId: string;

    @Column()
    userId: string;

    @Column({ nullable: true })
    message?: string;

    @Column({
        type: 'enum',
        enum: NotificationType,
        nullable: true,
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