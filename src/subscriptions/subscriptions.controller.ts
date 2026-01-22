import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { RequestUser } from 'src/common/interfaces/request-with-user';

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

