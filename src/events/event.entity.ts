import { NotificationLog } from "../notifications/notification-log.entity";
import { Subscription } from "../subscriptions/subscription.entity";
import { User } from "../users/user.entity";
import { 
    Column, 
    CreateDateColumn, 
    DeleteDateColumn, 
    Entity, 
    Index, 
    JoinColumn, 
    ManyToOne, 
    OneToMany, 
    PrimaryGeneratedColumn, 
    UpdateDateColumn 
} from "typeorm";

@Entity('events')
@Index(['creatorId'])
@Index(['isActive'])
@Index(['isPopular'])
@Index(['startAt'])
export class Event {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column()
    creatorId: string; //userId

    @ManyToOne(() => User, (user) => user.events, { onDelete: 'CASCADE'})
    @JoinColumn({ name: 'creatorId' })
    creator: User;

    @Column({ type: 'timestamptz' })
    startAt: Date;

    @Column({ type: 'timestamptz', nullable: true })
    endAt?: Date;

    @Column({ default: true })
    isActive: boolean;
    
    @Column({ default: 0 })
    subscribersCount: number;

    @Column({ default: false })
    isPopular: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt: Date;

    //relations
    @OneToMany(() => Subscription, (sub) => sub.event)
    subscriptions: Subscription[];

    @OneToMany(() => NotificationLog, (log) => log.event)
    notificationLogs: NotificationLog[];
}