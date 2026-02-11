import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationStats } from 'src/notifications/notification-stats.entity';
import { Event } from 'src/events/event.entity';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationStats,
      Event,
    ]),
    BullModule.registerQueue({ name: 'events' }),
    BullModule.registerQueue({ name: 'notifications' }),
  ],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}


