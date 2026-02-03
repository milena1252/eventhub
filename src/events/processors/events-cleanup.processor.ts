import { Process, Processor } from "@nestjs/bull";
import { InjectRepository } from "@nestjs/typeorm";
import type { Job } from "bull";
import { LessThan, Repository } from "typeorm";
import { Event } from "../event.entity";

@Processor('events')
export class EventsCleanupProcessor {
    constructor(
        @InjectRepository(Event)
        private readonly eventRepo: Repository<Event>,
    ) {}

    @Process('cleanup-expired-events')
    async handleCleanup(job: Job) {
        const now = new Date();

        const expiredEvents = await this.eventRepo.find({
            where: {
                endAt: LessThan(now),
                isActive: true,
            },
        });

        if (expiredEvents.length === 0) {
            return { cleaned: 0 };
        }

        const ids = expiredEvents.map(e => e.id);

        await this.eventRepo
            .createQueryBuilder()
            .update(Event)
            .set({ isActive: false })
            .whereInIds(ids)
            .execute();

        console.log(`[CLEANUP] Deactivated ${ids.length} expired events`);

        return { cleaned: ids.length, at: now };
    }
}

