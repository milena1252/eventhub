import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Outbox, OutboxStatus } from './outbox.entity';
import { Repository } from 'typeorm';
import { Subscription } from 'src/subscriptions/subscription.entity';
import { NotificationChannel, NotificationStatus, NotificationType } from 'src/notifications/notification-log.entity';
import { Event } from 'src/events/event.entity';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class OutboxService {
    constructor(
        @InjectRepository(Outbox)
        private readonly outboxRepo: Repository<Outbox>,

        @InjectRepository(Subscription)
        private readonly subRepo: Repository<Subscription>,

        @InjectRepository(Event)
        private readonly eventRepo: Repository<Event>,

        private readonly notifications: NotificationsService,
    ) {}

    async add(type: NotificationType, payload: any) {
        const record = this.outboxRepo.create({
            type,
            payload, 
            status: OutboxStatus.PENDING,
        });

        return this.outboxRepo.save(record);
    }

    async processPending(limit = 10) {
        const pending = await this.outboxRepo.find({
            where: { status: OutboxStatus.PENDING },
            order: { createdAt: "ASC" },
            take: limit,
        });

        let processed = 0;
        let failed = 0;

        for (const record of pending) {
            try {
                await this.processOne(record);

                record.status = OutboxStatus.PROCESSED;
                record.error = undefined;

                await this.outboxRepo.save(record);
                processed++;
            } catch (err: any) {
                record.status = OutboxStatus.FAILED;
                record.error = err?.message ?? "Unknown error";

                await this.outboxRepo.save(record);
                failed++;
            }
        }

        return { processed, failed };
    }

    private async processOne(record: Outbox) {
        const { eventId } = record.payload;

        const event = await this.eventRepo.findOne({ where: { id: eventId }});
        if (!event) return;

        const subs = await this.subRepo.find({
            where: { eventId, isActive: true },
        });

        const userIds = subs.map((s) => s.userId);

        if (userIds.length === 0) return;

        if (record.type === NotificationType.EVENT_UPDATED) {
            await this.notifications.notifyEventSubscribers(
                eventId,
                userIds,
                NotificationType.EVENT_UPDATED,
                `Event "${event.title}" was updated`,
            );
            return;
        }

        if (record.type === NotificationType.EVENT_CANCELLED) {
            await this.notifications.notifyEventSubscribers(
                eventId,
                userIds,
                NotificationType.EVENT_CANCELLED,
                `Event "${event.title}" was cancelled`,
            );
            return;
        }

        if (record.type === NotificationType.EVENT_DEACTIVATED) {
            await this.notifications.notifyEventSubscribers(
                eventId,
                userIds,
                NotificationType.EVENT_DEACTIVATED,
                `Event "${event.title}" was deactivated`,
            );
            return;
        }

        if (record.type === NotificationType.EVENT_REACTIVATED) {
            await this.notifications.notifyEventSubscribers(
                eventId,
                userIds,
                NotificationType.EVENT_REACTIVATED,
                `Event "${event.title}" was reactivated`,
            );
            return;
        }

        throw new Error(`Unknown outbox type: ${record.type}`);
    }
}
