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

@Module({
  imports: [
    CommonModule,
    
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty' }
          : undefined,
        level: 'info',
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

    EventsModule,

    UsersModule,

    AuthModule,

    SubscriptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
