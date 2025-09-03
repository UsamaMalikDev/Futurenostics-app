import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app/app.module';
import { UsersService } from '../users/users.service';
import { TasksService } from '../tasks/tasks.service';
import { UserRole } from '../users/schemas/user.schema';
import { TaskPriority, TaskStatus } from '../tasks/schemas/task.schema';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const usersService = app.get(UsersService);
    const tasksService = app.get(TasksService);

    console.log('🌱 Starting database seeding...');

    // Create test organization ID
    const orgId = '507f1f77bcf86cd799439011';

    // Create users with different roles
    const adminUser = await usersService.create(
      'admin@example.com',
      'admin123',
      orgId,
      [UserRole.ADMIN],
      'Admin User',
    );
    console.log('✅ Created admin user:', adminUser.email);

    const managerUser = await usersService.create(
      'manager@example.com',
      'manager123',
      orgId,
      [UserRole.MANAGER],
      'Manager User',
    );
    console.log('✅ Created manager user:', managerUser.email);

    const regularUser = await usersService.create(
      'user@example.com',
      'user123',
      orgId,
      [UserRole.USER],
      'Regular User',
    );
    console.log('✅ Created regular user:', regularUser.email);

    // Create sample tasks
    const tasks = [
      {
        title: 'Complete project documentation',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        tags: ['documentation', 'project'],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      },
      {
        title: 'Review code changes',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        tags: ['code-review', 'development'],
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      },
      {
        title: 'Update dependencies',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        tags: ['maintenance', 'security'],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      },
      {
        title: 'Prepare presentation',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        tags: ['presentation', 'meeting'],
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago (overdue)
      },
    ];

    for (const taskData of tasks) {
      const task = await tasksService.create(
        taskData,
        regularUser._id.toString(),
        orgId,
      );
      console.log('✅ Created task:', task.title);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Manager: manager@example.com / manager123');
    console.log('User: user@example.com / user123');
    console.log('\n🔗 Test the API at: http://localhost:3000');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await app.close();
  }
}

seed();
