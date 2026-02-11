import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { DataSource, In, Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateManyEventsDto } from './dto/update-many-events.dto';
import { NotificationType } from 'src/notifications/notification-log.entity';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { ImportEventsDto } from './dto/import-events.dto';
import { OutboxService } from 'src/outbox/outbox.service';

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(Event)
        private readonly eventRepo: Repository<Event>,
        private readonly dataSource: DataSource,
        @InjectQueue('events')
        private readonly eventsQueue: Queue,
        private readonly outbox: OutboxService,
    ) {}

    async create(dto: CreateEventDto, creatorId: string): Promise<Event> {
        const event = this.eventRepo.create({
            ...dto,
            creatorId,
            isActive: true,
        });

        return this.eventRepo.save(event);
    }

    async findAll(): Promise<Event[]> {
        return this.eventRepo.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Event> {
        const event = await this.eventRepo.findOne({ 
            where: { id },
         });

        if (!event) {
            throw new NotFoundException(`Event ${id} not found`);
        }

        return event;
    }

    async update(id: string, dto: UpdateEventDto): Promise<Event> {
        const event = await this.findOne(id);
        this.eventRepo.merge(event, dto);

        const saved = await this.eventRepo.save(event);

        // const userIds = await this.subscriptions.findEventSubscribers(event.id);
        // await this.notifications.notifyEventSubscribers(
        //     event.id,
        //     userIds,
        //     NotificationType.EVENT_UPDATED,
        //     `Event "${event.title}" was updated`,
        // );

        await this.outbox.add(NotificationType.EVENT_UPDATED, { eventId: event.id });

        return saved;
    }

    async remove(id: string) {
        const event = await this.findOne(id);

        // const userIds = await this.subscriptions.findEventSubscribers(event.id);
        // await this.notifications.notifyEventSubscribers(
        //     event.id,
        //     userIds,
        //     NotificationType.EVENT_CANCELLED,
        //     `Event "${event.title}" was cancelled`,
        // );

        await this.outbox.add(NotificationType.EVENT_CANCELLED, { eventId: event.id });

        await this.eventRepo.softDelete(event.id);

    }

    async updateMany(dto: UpdateManyEventsDto) {
        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();

        try {
            const events = await runner.manager.find(Event, {
                where: { id: In(dto.ids) },
            });

            if (events.length !== dto.ids.length) {
                throw new NotFoundException('Some events are not found');
            }

            await runner.manager
                .createQueryBuilder()
                .update(Event)
                .set({ isActive: dto.isActive })
                .whereInIds(dto.ids)
                .execute();
            
            await runner.commitTransaction();

            // for (const event of events) {
            //     const userIds = await this.subscriptions.findEventSubscribers(event.id);

            //     if (userIds.length > 0) {
            //         await this.notifications.notifyEventSubscribers(
            //             event.id,
            //             userIds,
            //             dto.isActive
            //                 ? NotificationType.EVENT_REACTIVATED
            //                 : NotificationType.EVENT_DEACTIVATED,
            //             dto.isActive
            //                 ? `Event "${event.title}" was reactivated`
            //                 : `Event "${event.title}" was deactivated`,
            //         );
            //     }
            // }

            for (const event of events) {
                await this.outbox.add(
                    dto.isActive
                    ? NotificationType.EVENT_REACTIVATED
                    : NotificationType.EVENT_DEACTIVATED,
                    { eventId: event.id },
                );
            }

            return { updated: dto.ids.length };
            
        } catch (e) {
            await runner.rollbackTransaction();
            throw e;
        } finally {
            await runner.release();
        }
    }

    async importEvents(dto: ImportEventsDto, creatorId: string) {
        return this.eventsQueue.add(
            'import-events', 
            {
                creatorId,
                events: dto.events,
            },
            {
                attempts: 3,
                backoff: 2000,
            },
        );
    }
}

//2 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMmEzYzUzZS05N2I3LTRjYTgtOGM5Yy0yZGFmNWY0MTk0M2EiLCJlbWFpbCI6InVzZXIyQHRlc3QuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NzA3MjQyNTksImV4cCI6MTc3MDcyNzg1OX0.O2u_TCAYvD09Dz_RREYP5uXkPSyy6hDwvf58Sr8UnyQ
//3 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ZTU5MzA3NC0zNGMwLTRkNTMtYTY4My0yMjBlYjljZjQ0MWUiLCJlbWFpbCI6InVzZXIzQHRlc3QuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NzA3MjQyOTAsImV4cCI6MTc3MDcyNzg5MH0.lEu2mNPQURF6YlyLG2J133kIgHGd_nq9_st3Ojs1knY
// id 422957b5-9a8a-4c55-9107-241615315355

