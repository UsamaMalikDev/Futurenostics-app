import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TasksSchedulerService } from './tasks-scheduler.service';
import { Task, TaskSchema } from './schemas/task.schema';
import { CacheService } from '../cache/cache.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    CacheModule.register(),
    ScheduleModule.forRoot(),
  ],
  controllers: [TasksController],
  providers: [TasksService, TasksSchedulerService, CacheService],
  exports: [TasksService],
})
export class TasksModule {} 