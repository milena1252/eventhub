"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventOwnerOrAdminGuard = void 0;
const common_1 = require("@nestjs/common");
const events_service_1 = require("../../events/events.service");
const user_entity_1 = require("../../users/user.entity");
let EventOwnerOrAdminGuard = class EventOwnerOrAdminGuard {
    eventsService;
    constructor(eventsService) {
        this.eventsService = eventsService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const eventId = request.params.id;
        if (!eventId) {
            throw new common_1.ForbiddenException('Event id is missing');
        }
        if (user.role === user_entity_1.UserRole.ADMIN) {
            return true;
        }
        const event = await this.eventsService.findOne(eventId);
        if (event.creatorId !== user.id) {
            throw new common_1.ForbiddenException('You are not the owner of this event');
        }
        return true;
    }
};
exports.EventOwnerOrAdminGuard = EventOwnerOrAdminGuard;
exports.EventOwnerOrAdminGuard = EventOwnerOrAdminGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [events_service_1.EventsService])
], EventOwnerOrAdminGuard);
//# sourceMappingURL=event-owner-or-admin.guard.js.map