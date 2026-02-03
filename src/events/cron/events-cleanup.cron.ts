import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import type { Queue } from "bull";

@Injectable()
export class EventsCleanupCron {
    constructor(
        @InjectQueue('events')
        private readonly queue: Queue,
    ) {}

    @Cron(CronExpression.EVERY_10_MINUTES)
    async cleanupExpiredEvents() {
        await this.queue.add('cleanup-expired-events', {});
    }
}