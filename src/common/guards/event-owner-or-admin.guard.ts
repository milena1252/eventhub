import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Request } from "express";
import { EventsService } from "src/events/events.service";
import { RequestUser } from "../interfaces/request-with-user";
import { UserRole } from "src/users/user.entity";

@Injectable()
export class EventOwnerOrAdminGuard implements CanActivate {
    constructor(private readonly eventsService: EventsService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const user = request.user as RequestUser;
        const eventId = request.params.id;

        if (!eventId) {
            throw new ForbiddenException('Event id is missing');
        }

        if (user.role === UserRole.ADMIN) {
            return true;
        }

        const event = await this.eventsService.findOne(eventId);

        if (event.creatorId !== user.id) {
            throw new ForbiddenException('You are not the owner of this event');
        }

        return true;
    }
}