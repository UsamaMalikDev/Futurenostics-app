import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  orgId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  ownerId: Types.ObjectId;

  @Prop({ required: true, index: 'text' })
  title: string;

  @Prop({ type: String, enum: TaskStatus, default: TaskStatus.TODO, index: true })
  status: TaskStatus;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Date, index: true })
  dueDate: Date;

  @Prop({ type: String, enum: TaskPriority, default: TaskPriority.MEDIUM, index: true })
  priority: TaskPriority;

  @Prop({ type: Boolean, default: false, index: true })
  isOverdue: boolean;

  @Prop({ type: Date })
  completedAt: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

// Compound indexes for better query performance
TaskSchema.index({ orgId: 1, status: 1 });
TaskSchema.index({ orgId: 1, ownerId: 1 });
TaskSchema.index({ orgId: 1, dueDate: 1 });
TaskSchema.index({ orgId: 1, priority: 1 });
TaskSchema.index({ orgId: 1, isOverdue: 1 });
TaskSchema.index({ orgId: 1, tags: 1 });

// Text index for search functionality
TaskSchema.index({ title: 'text', tags: 'text' });

// Index for overdue tasks background job
TaskSchema.index({ dueDate: 1, status: 1, isOverdue: 1 }); 