import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { getQueueToken } from '@nestjs/bull';
import { OutboxService } from 'src/outbox/outbox.service';
import { NotificationType } from 'src/notifications/notification-log.entity';
import { NotFoundException } from '@nestjs/common';

describe('EventsService (unit)', () => {
  let service: EventsService;

   const repo = {
    find: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
  };

  const outbox = {
    add: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: getRepositoryToken(Event), useValue: repo },
        { provide: DataSource, useValue: {} },
        { provide: SubscriptionsService, useValue: {} },
        { provide: NotificationsService, useValue: {} },
        { provide: getQueueToken('events'), useValue: { add: jest.fn() } },
        { provide: OutboxService, useValue: outbox },
      ],
    }).compile();

    service = module.get(EventsService);
  });

  it('update() should save event and create outbox record', async () => {
    const event = { id: 'e1', title: 'Old title' };

    repo.findOne.mockResolvedValue(event);
    repo.save.mockResolvedValue({ ...event, title: 'New title' });

    const result = await service.update('e1', { title: 'New title' });

    expect(result.title).toBe('New title');

    expect(outbox.add).toHaveBeenCalledWith(
      NotificationType.EVENT_UPDATED,
      { eventId: 'e1' },
    );
  });

  it('update() throws NotFoundException if event not found', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.update('missing', { title: 'X' }))
      .rejects
      .toBeInstanceOf(NotFoundException);

    expect(outbox.add).not.toHaveBeenCalled();
  });
});
