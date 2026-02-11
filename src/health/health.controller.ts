import { Controller, Get } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { HealthCheck, HealthCheckService, MicroserviceHealthIndicator, TypeOrmHealthIndicator } from '@nestjs/terminus';



@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private db: TypeOrmHealthIndicator,
        private microservise: MicroserviceHealthIndicator,

    ) {}

    //liveness
    @Get('live')
    live() {
        return {
            status: 'ok',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        };
    }

    //readiness
    @Get('ready')
    @HealthCheck()
    ready() {
        return this.health.check([
            () => this.db.pingCheck('database'),

            () => 
                this.microservise.pingCheck('redis', {
                    transport: Transport.REDIS,
                    options: {
                        host: process.env.REDIS_HOST ?? 'localhost',
                        port: +(process.env.REDIS_PORT ?? 6379),
                    },
                }),
        ]);
    }
}
