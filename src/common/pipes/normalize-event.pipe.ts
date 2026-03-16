import { Injectable, PipeTransform } from "@nestjs/common";
import { CreateEventDto } from "src/events/dto/create-event.dto";

@Injectable()
export class NormalizeEventPipe implements PipeTransform {
    transform(dto: CreateEventDto) {
        if (dto.title) {
            const normalized = dto.title.trim().replace(/\s+/g, ' ');
            dto.title = normalized[0].toUpperCase() + normalized.slice(1);
        }

        if (dto.description) {
            dto.description = dto.description.trim().replace(/\s+/g, ' ');
        }

        return dto;
    }
}