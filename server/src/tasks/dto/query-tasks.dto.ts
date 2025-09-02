import { IsOptional, IsString, IsEnum, IsArray, IsMongoId, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TaskStatus, TaskPriority } from '../schemas/task.schema';

export class QueryTasksDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsMongoId()
  ownerId?: string;

  @IsOptional()
  @IsDateString()
  dueDateFrom?: string;

  @IsOptional()
  @IsDateString()
  dueDateTo?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isOverdue?: boolean;
} 