import { Process, Processor } from "@nestjs/bull";
import { InjectRepository } from "@nestjs/typeorm";
import { Event } from "../event.entity";
import { Repository } from "typeorm";
import { Subscription } from "src/subscriptions/subscription.entity";
import type { Job } from "bull";

@Processor('events')
export class EventsStatsProcessor {
    constructor(
        @InjectRepository(Event)
        private readonly eventRepo: Repository<Event>,
        @InjectRepository(Subscription)
        private readonly subRepo: Repository<Subscription>,
    ) {}

    @Process('recalculate-stats')
    async handleRecalculate(job: Job) {
        const events = await this.eventRepo.find({
            where: { isActive: true },
        });

        for (const event of events) {
            const count = await this.subRepo.count({
                where: {
                    eventId: event.id,
                    isActive: true,
                },
            });

            await this.eventRepo.update(event.id, {
                subscribersCount: count,
                isPopular: count >= 10,
            });
        }

        return { processed: events.length };
    }
}