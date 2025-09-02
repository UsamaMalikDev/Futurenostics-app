import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TasksService } from './tasks.service';

@Injectable()
export class TasksSchedulerService {
  private readonly logger = new Logger(TasksSchedulerService.name);

  constructor(private readonly tasksService: TasksService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleOverdueTasks() {
    try {
      this.logger.log('Starting overdue tasks check...');
      await this.tasksService.markOverdueTasks();
      this.logger.log('Overdue tasks check completed successfully');
    } catch (error) {
      this.logger.error('Error checking overdue tasks:', error);
    }
  }
} 