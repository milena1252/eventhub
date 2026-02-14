import { IsArray, ValidateNested } from "class-validator";
import { ImportEventDto } from "./import-event.dto"
import { Type } from "class-transformer";

export class ImportEventsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ImportEventDto)
    events: ImportEventDto[];
}