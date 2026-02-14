import { Process, Processor } from "@nestjs/bull";
import { InjectRepository } from "@nestjs/typeorm";
import { Event } from "../event.entity";
import { Repository } from "typeorm";
import { ImportEventDto } from "../dto/import-event.dto";
import type { Job } from "bull";

@Processor('events')
export class EventsImportProcessor {
    constructor(
        @InjectRepository(Event)
        private readonly eventRepo: Repository<Event>,
    ) {}

    @Process('import-events')
    async handle(job: Job<{ creatorId: string; events: ImportEventDto[] }>) {
        const { creatorId, events } = job.data;

        const created = events.map((e) => 
            this.eventRepo.create({
                title: e.title,
                description: e.description ?? '',
                startAt: new Date(e.startAt),
                isActive: e.isActive ?? true,
                creatorId,
            }),
        );

        const saved = await this.eventRepo.save(created);

        return {
            imported: saved.length,
            ids: saved.map((e) => e.id),
        };
    }
}