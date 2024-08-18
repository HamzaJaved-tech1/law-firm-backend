import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';

import { catchError, map, of, zip } from 'rxjs';

@Controller('healthcheck')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: MongooseHealthIndicator,

  ) {}

  @Get()
  @HealthCheck()
  async check() {
    const handleError = (error: any) => {
      return of({ error: error });
    };

    const handleServiceResponse = (response: HealthCheckResult | any) => {
      if (response.status === 'ok') return 200;
      return 500;
    };

    const handleEventBusResponse = (response: boolean) => {
      return response ? 200 : 500;
    };

    const databse$ = of(
      await this.health.check([() => this.db.pingCheck('mondodb')]),
    ).pipe(catchError(handleError));
  
    return zip(databse$).pipe(
      map(([databaseHealth]) => ({
        database: handleServiceResponse(databaseHealth),
 
        timestamp: Date.now(),
      })),
    );
  }
}
