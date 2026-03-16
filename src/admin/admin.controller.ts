import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserRole } from 'src/users/user.entity';
import { AdminService } from './admin.service';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { ImportEventsDto } from 'src/events/dto/import-events.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        @InjectQueue('events')
        private readonly eventsQueue: Queue,
        @InjectQueue('notifications')
        private readonly notificationsQueue: Queue,
    ) {}

    @Post('import-events')
    importEvents(@Body() dto: ImportEventsDto, @Req() req: any) {
        return this.eventsQueue.add('import-events', {
            creatorId: req.user.id,
            events: dto.events,
        });
    }

    @Post('recalculate-event-stats')
    recalculateEventStats() {
        return this.eventsQueue.add('recalculate-stats', {});
    }

    @Post('recalculate-notification-stats')
    recalculateNotificationStats() {
        return this.notificationsQueue.add('recalculate-notification-stats', {});
    }
    
    @Get('event-stats')
    getEventStats() {
        return this.adminService.getEventStats();
    }

    @Get('notification-stats')
    getNotificationStats() {
        return this.adminService.getNotificationStats();
    }    
}


