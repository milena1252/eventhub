import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateManyEventsDto } from './dto/update-many-events.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { RequestUser } from 'src/common/interfaces/request-with-user';
import { EventOwnerOrAdminGuard } from 'src/common/guards/event-owner-or-admin.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/user.entity';

@Controller('events')
export class EventsController {
    constructor(
        private readonly events: EventsService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    @HttpCode(201)
    create(
        @Body() dto: CreateEventDto,
        @CurrentUser() user: RequestUser,
    ) {
        return this.events.create(dto, user.id);
    }

    @Get()
    findAll() {
        return this.events.findAll();
    }

    @Get(':id')
    findOne(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.events.findOne(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Patch('bulk')
    updateMany(@Body() dto: UpdateManyEventsDto) {
        return this.events.updateMany(dto);
    }

    @UseGuards(JwtAuthGuard, EventOwnerOrAdminGuard)
    @Patch(':id')
    update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: UpdateEventDto
    ) {
        return this.events.update(id, dto);
    }

    @UseGuards(JwtAuthGuard, EventOwnerOrAdminGuard)
    @Delete(':id')
    @HttpCode(204)
    remove(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.events.remove(id);
    }
}
