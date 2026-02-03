import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('notification_stats')
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