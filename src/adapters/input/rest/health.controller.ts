import { Controller, Get } from '@nestjs/common';
import { DOMAIN_CONSTANTS } from '../../../domain/constants/app.constants';
import { API_ROUTES } from './routes.constants';

@Controller(API_ROUTES.HEALTH)
export class HealthController {
  @Get()
  health() {
    return {
      status: DOMAIN_CONSTANTS.STATUS.OK,
      timestamp: new Date().toISOString(),
    };
  }
}
