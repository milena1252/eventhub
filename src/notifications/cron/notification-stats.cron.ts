import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import type { Queue } from "bull";

@Injectable()
export class NotificationStatsCron {
    constructor(
        @InjectQueue('notifications')
        private readonly queue: Queue,
    ) {}

    @Cron(CronExpression.EVERY_HOUR)
    async recalculateStats() {
        await this.queue.add('recalculate-notification-stats', {});
    }
}