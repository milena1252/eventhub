import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateManyEventsDto } from './dto/update-many-events.dto';
import type { RequestUser } from 'src/common/interfaces/request-with-user';
export declare class EventsController {
    private readonly events;
    constructor(events: EventsService);
    create(dto: CreateEventDto, user: RequestUser): Promise<import("./event.entity").Event>;
    findAll(): Promise<import("./event.entity").Event[]>;
    findOne(id: string): Promise<import("./event.entity").Event>;
    updateMany(dto: UpdateManyEventsDto): Promise<{
        updated: number;
    }>;
    update(id: string, dto: UpdateEventDto): Promise<import("./event.entity").Event>;
    remove(id: string): Promise<void>;
}
