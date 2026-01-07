import { CanActivate, ExecutionContext } from "@nestjs/common";
import { EventsService } from "src/events/events.service";
export declare class EventOwnerOrAdminGuard implements CanActivate {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
