import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationStats } from 'src/notifications/notification-stats.entity';
import { Repository } from 'typeorm';
import { Event } from 'src/events/event.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(NotificationStats)
        private readonly statsRepo: Repository<NotificationStats>,

        @InjectRepository(Event)
        private readonly eventRepo: Repository<Event>,
    ) {}

    getNotificationStats() {
        return this.statsRepo.findOne({
            where: {},
        });
    }

    async getEventStats() {
        const total = await this.eventRepo.count();
        const active = await this.eventRepo.count({ where: { isActive: true } });
        const popular = await this.eventRepo.count({ where: { isPopular: true } });

        return {
            total,
            active,
            popular,
        };
    }
}
