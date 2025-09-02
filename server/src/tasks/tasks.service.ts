import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskStatus } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { BulkUpdateTasksDto } from './dto/bulk-update-tasks.dto';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string, orgId: string): Promise<Task> {
    const task = new this.taskModel({
      ...createTaskDto,
      ownerId: new Types.ObjectId(userId),
      orgId: new Types.ObjectId(orgId),
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
    });
    return task.save();
  }

  async findAll(queryDto: QueryTasksDto, user: any): Promise<{ tasks: Task[]; nextCursor?: string }> {
    const { cursor, limit = 20, ...filters } = queryDto;
    
    // Build query based on user role
    let query: any = { orgId: new Types.ObjectId(user.orgId) };
    
    // Apply role-based restrictions
    if (user.roles.includes(UserRole.USER) && !user.roles.includes(UserRole.MANAGER)) {
      query.ownerId = new Types.ObjectId(user.id);
    }
    
    // Apply filters
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.ownerId) query.ownerId = new Types.ObjectId(filters.ownerId);
    if (filters.isOverdue !== undefined) query.isOverdue = filters.isOverdue;
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }
    
    // Date range filters
    if (filters.dueDateFrom || filters.dueDateTo) {
      query.dueDate = {};
      if (filters.dueDateFrom) query.dueDate.$gte = new Date(filters.dueDateFrom);
      if (filters.dueDateTo) query.dueDate.$lte = new Date(filters.dueDateTo);
    }
    
    // Text search
    if (filters.search) {
      query.$text = { $search: filters.search };
    }
    
    // Cursor pagination
    if (cursor) {
      query._id = { $gt: new Types.ObjectId(cursor) };
    }
    
    const tasks = await this.taskModel
      .find(query)
      .sort({ _id: 1 })
      .limit(limit + 1)
      .exec();
    
    let nextCursor: string | undefined;
    if (tasks.length > limit) {
      nextCursor = tasks[limit - 1]._id.toString();
      tasks.splice(limit);
    }
    
    return { tasks, nextCursor };
  }

  async findOne(id: string, user: any): Promise<Task> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    
    // Check access permissions
    if (task.orgId.toString() !== user.orgId) {
      throw new ForbiddenException('Access denied');
    }
    
    if (user.roles.includes(UserRole.USER) && !user.roles.includes(UserRole.MANAGER)) {
      if (task.ownerId.toString() !== user.id) {
        throw new ForbiddenException('Access denied');
      }
    }
    
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, user: any): Promise<Task> {
    const task = await this.findOne(id, user);
    
    const updateData: any = { ...updateTaskDto };
    if (updateTaskDto.dueDate) {
      updateData.dueDate = new Date(updateTaskDto.dueDate);
    }
    
    const updatedTask = await this.taskModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    
    return updatedTask;
  }

  async bulkUpdate(bulkUpdateDto: BulkUpdateTasksDto, user: any): Promise<Task[]> {
    const updatedTasks: Task[] = [];
    
    for (const { id, updates } of bulkUpdateDto.tasks) {
      try {
        const task = await this.update(id, updates, user);
        updatedTasks.push(task);
      } catch (error) {
        // Continue with other tasks even if one fails
        console.error(`Failed to update task ${id}:`, error.message);
      }
    }
    
    return updatedTasks;
  }

  async markOverdueTasks(): Promise<void> {
    const now = new Date();
    await this.taskModel.updateMany(
      {
        dueDate: { $lt: now },
        status: { $nin: [TaskStatus.DONE, TaskStatus.CANCELLED] },
        isOverdue: false,
      },
      { isOverdue: true }
    ).exec();
  }
} 