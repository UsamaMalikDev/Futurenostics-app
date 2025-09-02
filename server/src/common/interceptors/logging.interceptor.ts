import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;
    const startTime = Date.now();

    // Log request
    this.logger.log({
      message: 'Incoming request',
      method,
      url,
      body: body ? JSON.stringify(body) : undefined,
      userId: user?.id,
      orgId: user?.orgId,
      userRoles: user?.roles,
      timestamp: new Date().toISOString(),
    });
    
    return next.handle().pipe(
      tap({
        next: (data) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          // Log response
          this.logger.log({
            message: 'Request completed',
            method,
            url,
            statusCode: 200,
            duration: `${duration}ms`,
            userId: user?.id,
            orgId: user?.orgId,
            timestamp: new Date().toISOString(),
          });
        },
        error: (error) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          // Log error
          this.logger.error({
            message: 'Request failed',
            method,
            url,
            statusCode: error.status || 500,
            duration: `${duration}ms`,
            error: error.message,
            stack: error.stack,
            userId: user?.id,
            orgId: user?.orgId,
            timestamp: new Date().toISOString(),
          });
        },
      }),
    );
  }
} 