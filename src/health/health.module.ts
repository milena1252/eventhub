import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController]
})
export class HealthModule {}
