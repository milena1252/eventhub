import { Event } from './event.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateManyEventsDto } from './dto/update-many-events.dto';
export declare class EventsService {
    private readonly eventRepo;
    private readonly dataSource;
    constructor(eventRepo: Repository<Event>, dataSource: DataSource);
    create(dto: CreateEventDto, creatorId: string): Promise<Event>;
    findAll(): Promise<Event[]>;
    findOne(id: string): Promise<Event>;
    update(id: string, dto: UpdateEventDto): Promise<Event>;
    remove(id: string): Promise<void>;
    updateMany(dto: UpdateManyEventsDto): Promise<{
        updated: number;
    }>;
}
