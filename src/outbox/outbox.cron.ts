import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { OutboxService } from "./outbox.service";

@Injectable()
export class OutboxCron {
    constructor(private readonly outboxservice: OutboxService) {}

    @Cron(CronExpression.EVERY_10_SECONDS)
    async handleOutbox() {
        await this.outboxservice.processPending(20);
    }
}