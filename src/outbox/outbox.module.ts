import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Outbox } from './outbox.entity';
import { Subscription } from 'src/subscriptions/subscription.entity';
import { Event } from 'src/events/event.entity';
import { OutboxService } from './outbox.service';
import { OutboxCron } from './outbox.cron';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Outbox,
            Subscription,
            Event,
        ]),
        NotificationsModule,
    ],
    providers: [OutboxService, OutboxCron],
    exports: [OutboxService],
})
export class OutboxModule {}
