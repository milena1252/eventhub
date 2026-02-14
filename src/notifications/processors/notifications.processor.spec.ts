import { Test, TestingModule } from "@nestjs/testing";
import { NotificationsProcessor } from "../notifications.processor"
import { getRepositoryToken } from "@nestjs/typeorm";
import { NotificationChannel, NotificationLog, NotificationStatus, NotificationType } from "../notification-log.entity";

describe('NotificationsProcessor (unit)', () => {
    let processor: NotificationsProcessor;

    const repo = {
        create: jest.fn(),
        save: jest.fn(),
    };

    beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
        providers: [
            NotificationsProcessor,
            { provide: getRepositoryToken(NotificationLog), useValue: repo },
          ],
        }).compile();
    
        processor = module.get(NotificationsProcessor);
    });

    it('should create log and mark as SENT', async () => {
        const log = { id: 'l1', status: NotificationStatus.PENDING };

        repo.create.mockReturnValue(log);
        repo.save.mockReturnValue(log);

        const job: any = {
            data: {
                eventId: 'e1',
                userId: 'u1',
                channel: NotificationChannel.EMAIL,
                type: NotificationType.EVENT_UPDATED,
                message: 'hello',
            },
        };

        const result = await processor.handle(job);

        expect(repo.create).toHaveBeenCalled();
        expect(log.status).toBe(NotificationStatus.SENT);
        expect(repo.save).toHaveBeenCalledTimes(2);
        expect(result).toEqual({ ok: true });
    });
});