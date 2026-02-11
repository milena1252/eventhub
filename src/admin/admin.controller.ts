import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/users/user.entity';
import { AdminService } from './admin.service';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { ImportEventsDto } from 'src/events/dto/import-events.dto';

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

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxYmYwMGZlYS1jYWJkLTQxNTQtOGUyMC1hNThhMjRiZDMwMGQiLCJlbWFpbCI6InVzZXIxQHRlc3QuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzcwMTg5NDA5LCJleHAiOjE3NzAxOTMwMDl9.K-Nh8zvOMg6Dgv24FBVqGgaS26zT5ehvMllh4rjtesY
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZDIwNTA0ZC02MDVjLTRlMTctYWVkMi0zZDI1NzAzZjc0MzYiLCJlbWFpbCI6Inlvc3lhQHRlc3QuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NzAxODk1MDMsImV4cCI6MTc3MDE5MzEwM30.6YKUtHDP3Fd8YMqrOvN_JlBZwwXTiosb3h64iVcq3vM
