import { Test } from "@nestjs/testing";
import { EventOwnerOrAdminGuard } from "./event-owner-or-admin.guard"
import { EventsService } from "src/events/events.service";
import { UserRole } from "src/users/user.entity";
import { ForbiddenException } from "@nestjs/common";

describe('EventOwnerOrAdminGuard (unit)', () => {
    let guard: EventOwnerOrAdminGuard;

    const eventsService = {
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module = await Test.createTestingModule({
            providers: [
                EventOwnerOrAdminGuard,
                { provide: EventsService, useValue: eventsService },
            ],
        }).compile();

        guard = module.get(EventOwnerOrAdminGuard);
    });

    function mockContext(user: any, eventId?: string) {
        return {
            switchToHttp: () => ({
                getRequest: () => ({
                    user,
                    params: { id: eventId },
                }),
            }),
        } as any;
    }

    it('should allow ADMIN', async () => {
        const ctx = mockContext({ id: 'u1', role: UserRole.ADMIN }, 'e1');

        const result = await guard.canActivate(ctx);

        expect(result).toBe(true);
        expect(eventsService.findOne).not.toHaveBeenCalled();
    });

    it('should allow event owner', async () => {
        eventsService.findOne.mockResolvedValue({ id: 'e1', creatorId: 'u1' });

        const ctx = mockContext({ id: 'u1', role: UserRole.USER }, 'e1');

        const result = await guard.canActivate(ctx);

        expect(result).toBe(true);
    });

    it('should deny if not owner', async () => {
        eventsService.findOne.mockResolvedValue({ id: 'e1', creatorId: 'u2' });

        const ctx = mockContext({ id: 'u1', role: UserRole.USER }, 'e1');

        await expect(guard.canActivate(ctx))
            .rejects
            .toBeInstanceOf(ForbiddenException);
    });

    it('should throw if event id missing', async () => {
        const ctx = mockContext({ id: 'u1', role: UserRole.USER });

        await expect(guard.canActivate(ctx))
            .rejects
            .toBeInstanceOf(ForbiddenException);
    });
});