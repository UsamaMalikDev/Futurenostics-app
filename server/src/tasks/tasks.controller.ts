import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { BulkUpdateTasksDto } from './dto/bulk-update-tasks.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('api/tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(CacheInterceptor)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(@Query() queryDto: QueryTasksDto, @Request() req) {
    return this.tasksService.findAll(queryDto, req.user);
  }

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user.id, req.user.orgId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req,
  ) {
    return this.tasksService.update(id, updateTaskDto, req.user);
  }

  @Patch('bulk')
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  async bulkUpdate(@Body() bulkUpdateDto: BulkUpdateTasksDto, @Request() req) {
    return this.tasksService.bulkUpdate(bulkUpdateDto, req.user);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    return this.tasksService.delete(id, req.user);
  }
} 