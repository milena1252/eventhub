import { IsBoolean, IsDateString, IsOptional, IsString, MinLength } from "class-validator";

export class ImportEventDto {
    @IsString()
    @MinLength(3)
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString()
    startAt: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}