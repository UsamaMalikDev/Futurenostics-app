import { IsArray, IsMongoId, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateTaskDto } from './update-task.dto';

export class BulkUpdateTaskDto {
  @IsMongoId()
  id: string;

  @IsObject()
  @ValidateNested()
  @Type(() => UpdateTaskDto)
  updates: UpdateTaskDto;
}

export class BulkUpdateTasksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUpdateTaskDto)
  tasks: BulkUpdateTaskDto[];
} 