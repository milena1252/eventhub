import { forwardRef, Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';
import { BullModule } from '@nestjs/bull';
import { EventsCleanupProcessor } from './processors/events-cleanup.processor';
import { EventsCleanupCron } from './cron/events-cleanup.cron';
import { Subscription } from 'src/subscriptions/subscription.entity';
import { EventsStatsProcessor } from './processors/events-stats.processor';
import { EventsStatsCron } from './cron/events-stats.cron';
import { EventsImportProcessor } from './processors/events-import.processor';
import { OutboxModule } from 'src/outbox/outbox.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Subscription]),
    forwardRef(() => SubscriptionsModule),
    NotificationsModule,
    OutboxModule,
    BullModule.registerQueue({
      name: 'events',
    }),
  ],
  controllers: [EventsController],
  providers: [
    EventsService, 
    EventsCleanupProcessor, 
    EventsCleanupCron,
    EventsStatsProcessor,
    EventsStatsCron,
    EventsImportProcessor,
  ],
  exports: [EventsService],
})
export class EventsModule {}


