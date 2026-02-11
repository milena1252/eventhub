import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import dbConfig from './config/db.config';
import { LoggerModule } from 'nestjs-pino';
import { CommonModule } from './common/common.module';
import { NotificationsModule } from './notifications/notifications.module';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminModule } from './admin/admin.module';
import { OutboxModule } from './outbox/outbox.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    
    CommonModule,
    
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty' }
          : undefined,
        level: 'info',
        serializers: {
          req(req) {
            return {
              method: req.method,
              url: req.url,
            };
          },
          res(res) {
            return {
              statusCode: res.statusCode,
            };
          },
        },
      },
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      load: [dbConfig],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db = config.get('db');

        return {
          ...db,
          autoLoadEntities: true,
        };
      },
    }),

    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: +(process.env.REDIS_PORT ?? 6379),
      },
    }),

    EventsModule,

    UsersModule,

    AuthModule,

    SubscriptionsModule,

    NotificationsModule,

    AdminModule,

    OutboxModule,

    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
