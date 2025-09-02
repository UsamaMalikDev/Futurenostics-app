import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';

@Controller()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mongoose: MongooseHealthIndicator,
  ) {}

  @Get('healthz')
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.mongoose.pingCheck('database'),
    ]);
  }

  @Get('readinessz')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.mongoose.pingCheck('database'),
    ]);
  }
} 