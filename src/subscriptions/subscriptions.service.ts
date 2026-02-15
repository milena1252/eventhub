import { ConflictException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from './subscription.entity';
import { Repository } from 'typeorm';
import { EventsService } from 'src/events/events.service';

@Injectable()
export class SubscriptionsService {
    constructor(
        @InjectRepository(Subscription)
        private readonly subRepo: Repository<Subscription>,
        @Inject(forwardRef(() => EventsService))
        private readonly eventService: EventsService,
    ) {}

    async subscribe(userId: string, eventId: string) {
        const event = await this.eventService.findOne(eventId);

        if (event.creatorId === userId) {
            throw new ForbiddenException('Cannot subscribe to your own event');
        }

        const existing = await this.subRepo.findOne({
            where: { userId, eventId },
        });

        if (existing) {
            if (existing.isActive) {
                throw new ConflictException('Already subscribed');
            }

            existing.isActive = true;
            return this.subRepo.save(existing);
        }

        const sub = this.subRepo.create({
            userId,
            eventId,
            isActive: true,
        });

        const saved = await this.subRepo.save(sub);
        
        return saved;
    }

    async unsubscribe(userId: string, eventId: string) {
        const sub = await this.subRepo.findOne({
            where: {userId, eventId, isActive: true },
        });

        if (!sub) {
            throw new NotFoundException('Subscription is not found');
        }

        sub.isActive = false;
        await this.subRepo.save(sub);
    }

    async findUserSubscriptions(userId: string) {
        return this.subRepo.find({
            where: { userId, isActive: true },
        });
    }

    async findEventSubscribers(eventId: string): Promise<string[]> {
        const subs = await this.subRepo.find({
            where: { eventId, isActive: true },
        });

        return subs.map(s => s.userId);
    }

}
