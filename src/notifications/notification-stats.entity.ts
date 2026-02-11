import { Column, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('notification_stats')
@Index(['calculateAt'])
export class NotificationStats {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ default: 0 })
    total: number;

    @Column({ default: 0 })
    sent: number;

    @Column({ default: 0 })
    failed: number;

    @Column({ default: 0 })
    pending: number;

    @UpdateDateColumn()
    calculateAt: Date;
}