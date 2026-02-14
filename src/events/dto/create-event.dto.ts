import { 
    IsBoolean,
    IsDateString, 
    IsOptional, 
    IsString, 
    MinLength, 
} from "class-validator";

export class CreateEventDto {
    @IsString()
    @MinLength(3)
    title: string;

    @IsString()
    @MinLength(10)
    description: string;

    @IsDateString()
    startAt: string;

    @IsOptional()
    @IsDateString()
    endAt?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}