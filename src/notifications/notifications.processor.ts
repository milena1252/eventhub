import { Processor, Process } from "@nestjs/bull";
import { InjectRepository } from "@nestjs/typeorm";
import type { Job } from "bull";
import { NotificationChannel, NotificationLog, NotificationStatus, NotificationType } from "./notification-log.entity";
import { Repository } from "typeorm";

@Processor('notifications')
export class NotificationsProcessor {
    constructor(
        @InjectRepository(NotificationLog)
        private readonly logRepo: Repository<NotificationLog>
    ) {}
     
    @Process('send-notification') 
    async handle(job: Job<{
        eventId: string;
        userId: string;
        channel: NotificationChannel;
        type: NotificationType;
        message: string;
    }>) {
        const { eventId, userId, channel, type, message } = job.data;

        const log = this.logRepo.create({
            eventId,
            userId,
            channel,
            type,
            message,
            status: NotificationStatus.PENDING,
        });

        await this.logRepo.save(log);

        try{
            //Fake send
            console.log(
                `[NOTIFY:${channel}] ${type} -> user=${userId}: ${message}`,
            );

            log.status = NotificationStatus.SENT;
            await this.logRepo.save(log);

            return { ok: true };
        } catch (e) {
            log.status = NotificationStatus.FAILED;
            log.error = e.message;
            await this.logRepo.save(log);
            throw e;
        }
    }
}