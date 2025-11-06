import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DOMAIN_CONSTANTS } from '@shared/domain/constants/app.constants';
import { API_ROUTES } from '@shared/adapters/input/rest/routes.constants';
import {
  SWAGGER_CONSTANTS,
  API_VERSIONING,
} from '@shared/adapters/input/rest/swagger.constants';

@ApiTags(SWAGGER_CONSTANTS.TAGS.HEALTH)
@Controller({
  path: API_ROUTES.HEALTH,
  version: API_VERSIONING.DEFAULT_VERSION,
})
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Verificar el estado de salud del sistema' })
  @ApiResponse({
    status: 200,
    description: 'Sistema funcionando correctamente',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: DOMAIN_CONSTANTS.STATUS.OK },
        timestamp: { type: 'string', example: '2024-01-15T09:00:00.000Z' },
      },
    },
  })
  health() {
    return {
      status: DOMAIN_CONSTANTS.STATUS.OK,
      timestamp: new Date().toISOString(),
    };
  }
}
