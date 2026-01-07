import { IsArray, IsBoolean, IsUUID } from "class-validator";

export class UpdateManyEventsDto {
    @IsArray()
    @IsUUID('4', { each: true })
    ids: string[];

    @IsBoolean()
    isActive: boolean;
}