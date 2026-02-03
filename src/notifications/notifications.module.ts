import { forwardRef, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { BullModule } from '@nestjs/bull';
import { NotificationsProcessor } from './notifications.processor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationLog } from './notification-log.entity';
import { NotificationStats } from './notification-stats.entity';
import { NotificationStatProcessor } from './processors/notification-stats.processor';
import { NotificationStatsCron } from './cron/notification-stats.cron';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationLog, NotificationStats]),
    BullModule.registerQueue({ name: 'notifications' }),
  ],
  providers: [
    NotificationsService,
    NotificationsProcessor,
    NotificationStatProcessor,
    NotificationStatsCron,
    ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
