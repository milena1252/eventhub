import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import type { RequestUser } from 'src/common/interfaces/request-user.interface';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
    constructor(
        private readonly subs: SubscriptionsService,
    ) {}

    @Post()
    subscribe(
        @Body() dto: CreateSubscriptionDto,
        @CurrentUser() user: RequestUser,
    ) {
        return this.subs.subscribe(user.id, dto.eventId);
    }

    @Delete(':eventId')
    unsubscribe(
        @Param('eventId', ParseUUIDPipe) eventId: string,
        @CurrentUser() user: RequestUser,
    ) {
        return this.subs.unsubscribe(user.id, eventId);
    }

    @Get('me')
    mySubscriptions(@CurrentUser() user:RequestUser) {
        return this.subs.findUserSubscriptions(user.id);
    }
}

