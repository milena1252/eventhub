"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const event_entity_1 = require("./event.entity");
const typeorm_2 = require("typeorm");
let EventsService = class EventsService {
    eventRepo;
    dataSource;
    constructor(eventRepo, dataSource) {
        this.eventRepo = eventRepo;
        this.dataSource = dataSource;
    }
    async create(dto, creatorId) {
        const event = this.eventRepo.create({
            ...dto,
            creatorId,
            isActive: true,
        });
        return this.eventRepo.save(event);
    }
    async findAll() {
        return this.eventRepo.find({
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const event = await this.eventRepo.findOne({
            where: { id },
        });
        if (!event) {
            throw new common_1.NotFoundException(`Event ${id} not found`);
        }
        return event;
    }
    async update(id, dto) {
        const event = await this.findOne(id);
        this.eventRepo.merge(event, dto);
        return this.eventRepo.save(event);
    }
    async remove(id) {
        const event = await this.findOne(id);
        await this.eventRepo.softDelete(event.id);
    }
    async updateMany(dto) {
        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();
        try {
            const events = await runner.manager.find(event_entity_1.Event, {
                where: { id: (0, typeorm_2.In)(dto.ids) },
            });
            if (events.length !== dto.ids.length) {
                throw new common_1.NotFoundException('Some events are not found');
            }
            await runner.manager
                .createQueryBuilder()
                .update(event_entity_1.Event)
                .set({ isActive: dto.isActive })
                .whereInIds(dto.ids)
                .execute();
            await runner.commitTransaction();
            return { updated: dto.ids.length };
        }
        catch (e) {
            await runner.rollbackTransaction();
            throw e;
        }
        finally {
            await runner.release();
        }
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], EventsService);
//# sourceMappingURL=events.service.js.map