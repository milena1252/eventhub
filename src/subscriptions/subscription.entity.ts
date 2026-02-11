import { Event } from "../events/event.entity";
import { User } from "../users/user.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('subscriptions')
@Index(['userId', 'eventId'], { unique: true })
@Index(['eventId'])
@Index(['userId'])
@Index(['isActive'])
export class Subscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column()
    eventId: string;

    @ManyToOne(() => User, (user) => user.subscriptions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Event, (event) => event.subscriptions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'eventId' })
    event: Event;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}