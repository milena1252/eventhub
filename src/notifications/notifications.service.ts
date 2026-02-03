import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bull';
import { NotificationChannel, NotificationType } from './notification-log.entity';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectQueue('notifications')
        private readonly queue: Queue,
    ) {}

    async notifyEventSubscribers(
        eventId: string,
        userIds: string[],
        type: NotificationType,
        message: string,
    ) {
        for (const userId of userIds) {
            await this.queue.add( 'send-notification', 
                {
                    eventId,
                    userId,
                    type,
                    message,
                    channel: NotificationChannel.EMAIL,
                },
                {
                    attempts: 3,
                    backoff: 2000,
                },
            );
        }
    }
}
