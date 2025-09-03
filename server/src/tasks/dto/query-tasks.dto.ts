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

  // Frontend sends 'q' for search query
  @IsOptional()
  @IsString()
  q?: string;

  // Also support 'search' for backward compatibility
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(tag => tag.trim()).filter(Boolean);
    }
    return value;
  })
  tags?: string[];

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  // Frontend sends 'scope' parameter
  @IsOptional()
  @IsString()
  @IsEnum(['my', 'org'])
  scope?: string;

  // Frontend sends sorting parameters
  @IsOptional()
  @IsString()
  @IsEnum(['createdAt', 'updatedAt', 'title', 'priority', 'status'])
  sortBy?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['asc', 'desc'])
  sortOrder?: string;

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