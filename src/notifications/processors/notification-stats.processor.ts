import { Process, Processor } from "@nestjs/bull";
import { InjectRepository } from "@nestjs/typeorm";
import { NotificationLog, NotificationStatus } from "../notification-log.entity";
import { Repository } from "typeorm";
import { NotificationStats } from "../notification-stats.entity";
import type { Job } from "bull";

@Processor('notifications')
export class NotificationStatProcessor {
    constructor(
        @InjectRepository(NotificationLog)
        private readonly logRepo: Repository<NotificationLog>,
        @InjectRepository(NotificationStats)
        private readonly statsRepo: Repository<NotificationStats>,
    ) {}

    @Process('recalculate-notification-stats')
    async handle(job: Job) {
        const total = await this.logRepo.count();
        const sent = await this.logRepo.count({
            where: { status: NotificationStatus.SENT },
        });
        const failed = await this.logRepo.count({
            where: { status: NotificationStatus.FAILED },
        });
        const pending = await this.logRepo.count({
            where: { status: NotificationStatus.PENDING },
        });

        //обновляем сущ.запись или создаем новую
        let stats = await this.statsRepo.findOne({ where: {} });

        if (!stats) {
            stats = this.statsRepo.create();
        }

        stats.total = total;
        stats.sent = sent;
        stats.failed = failed;
        stats.pending = pending;

        await this.statsRepo.save(stats);

        return {
            total,
            sent,
            failed,
            pending,
        }
    }    
}