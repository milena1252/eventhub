import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { DataSource, In, Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateManyEventsDto } from './dto/update-many-events.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { NotificationType } from 'src/notifications/notification-log.entity';

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(Event)
        private readonly eventRepo: Repository<Event>,
        private readonly dataSource: DataSource,
        private readonly subscriptions: SubscriptionsService,
        private readonly notifications: NotificationsService,
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

        const userIds = await this.subscriptions.findEventSubscribers(event.id);

        await this.notifications.notifyEventSubscribers(
            event.id,
            userIds,
            NotificationType.EVENT_UPDATED,
            `Event "${event.title}" was updated`,
        );

        return saved;
    }

    async remove(id: string) {
        const event = await this.findOne(id);

        const userIds = await this.subscriptions.findEventSubscribers(event.id);

        await this.notifications.notifyEventSubscribers(
            event.id,
            userIds,
            NotificationType.EVENT_CANCELLED,
            `Event "${event.title}" was cancelled`,
        );

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

            for (const event of events) {
                const userIds = await this.subscriptions.findEventSubscribers(event.id);

                if (userIds.length > 0) {
                    await this.notifications.notifyEventSubscribers(
                        event.id,
                        userIds,
                        dto.isActive
                            ? NotificationType.EVENT_REACTIVATED
                            : NotificationType.EVENT_DEACTIVATED,
                        dto.isActive
                            ? `Event "${event.title}" was reactivated`
                            : `Event "${event.title}" was deactivated`,
                    );
                }
            }

            return { updated: dto.ids.length };
            
        } catch (e) {
            await runner.rollbackTransaction();
            throw e;
        } finally {
            await runner.release();
        }
    }
}

