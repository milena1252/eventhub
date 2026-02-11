import { NotificationType } from "src/notifications/notification-log.entity";
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

export enum OutboxStatus {
    PENDING = 'PENDING',
    PROCESSED = 'PROCESSED',
    FAILED = 'FAILED',
}

@Entity('outbox')
@Index(['status'])
@Index(['createdAt'])
export class Outbox {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: NotificationType,
    })
    type: NotificationType; 

    @Column({ type: 'jsonb' })
    payload: any;

    @Column({
        type: 'enum',
        enum: OutboxStatus,
        default: OutboxStatus.PENDING,
    })
    status: OutboxStatus;

    @Column({ nullable: true })
    error?: string;

    @CreateDateColumn()
    createdAt: Date;
}   
