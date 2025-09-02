import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('tasks') // Same name as the queue
export class WorkerProcessor {
  @Process('heavyTask') // Job type
  async handleHeavyTask(job: Job) {
    console.log('Worker received job:', job.data);

    // simulate long process
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log('Worker finished job:', job.data);

    return { status: 'done', input: job.data };
  }
}
