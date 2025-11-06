import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INFRASTRUCTURE_CONSTANTS } from '@shared/infrastructure/constants/app.constants';
import { ENV_VARIABLES } from '@shared/infrastructure/constants/env-variables.constants';
import { VALIDATION_MESSAGES } from '@shared/infrastructure/constants/validation-messages.constants';
import { TYPEORM_CONSTANTS } from '@shared/infrastructure/constants/typeorm.constants';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {
    // Validar que todas las variables requeridas estén presentes
    this.validateRequiredVariables();
  }

  private validateRequiredVariables(): void {
    const requiredVars = [
      ENV_VARIABLES.NODE_ENV,
      ENV_VARIABLES.PORT,
      ENV_VARIABLES.DB_HOST,
      ENV_VARIABLES.DB_PORT,
      ENV_VARIABLES.DB_USERNAME,
      ENV_VARIABLES.DB_PASSWORD,
      ENV_VARIABLES.DB_DATABASE,
    ];

    const missingVars: string[] = [];

    for (const varName of requiredVars) {
      const value = this.configService.get<string>(varName);
      if (value === undefined || value === null || value === '') {
        missingVars.push(varName);
      }
    }

    if (missingVars.length > 0) {
      throw new Error(
        VALIDATION_MESSAGES.ENV_VARIABLES_MISSING(missingVars.join(', ')),
      );
    }
  }

  // Configuración de la aplicación
  get nodeEnv(): string {
    return this.configService.get<string>(ENV_VARIABLES.NODE_ENV)!;
  }

  get port(): number {
    return this.configService.get<number>(ENV_VARIABLES.PORT)!;
  }

  get host(): string {
    return this.configService.get<string>(
      ENV_VARIABLES.HOST,
      INFRASTRUCTURE_CONSTANTS.HOST.LOCALHOST,
    );
  }

  // Configuración de base de datos
  get dbHost(): string {
    return this.configService.get<string>(ENV_VARIABLES.DB_HOST)!;
  }

  get dbPort(): number {
    return this.configService.get<number>(ENV_VARIABLES.DB_PORT)!;
  }

  get dbUsername(): string {
    return this.configService.get<string>(ENV_VARIABLES.DB_USERNAME)!;
  }

  get dbPassword(): string {
    return this.configService.get<string>(ENV_VARIABLES.DB_PASSWORD)!;
  }

  get dbDatabase(): string {
    return this.configService.get<string>(ENV_VARIABLES.DB_DATABASE)!;
  }

  get dbEncrypt(): boolean {
    return (
      this.configService.get<string>(
        ENV_VARIABLES.DB_ENCRYPT,
        INFRASTRUCTURE_CONSTANTS.BOOLEAN.FALSE,
      ) === INFRASTRUCTURE_CONSTANTS.BOOLEAN.TRUE
    );
  }

  // Configuración de Azure Service Bus
  get serviceBusConnectionString(): string | undefined {
    const value = this.configService.get<string>(
      ENV_VARIABLES.AZURE_SERVICE_BUS_CONNECTION_STRING,
    );
    return value || undefined;
  }

  get serviceBusQueueName(): string | undefined {
    const value = this.configService.get<string>(
      ENV_VARIABLES.AZURE_SERVICE_BUS_QUEUE_NAME,
    );
    return value || undefined;
  }

  // Método helper para obtener toda la configuración de TypeORM
  get typeOrmConfig() {
    return {
      type: INFRASTRUCTURE_CONSTANTS.DATABASE.TYPE.MSSQL,
      host: this.dbHost,
      port: this.dbPort,
      username: this.dbUsername,
      password: this.dbPassword,
      database: this.dbDatabase,
      synchronize: false,
      options: {
        encrypt: this.dbEncrypt,
        trustServerCertificate: true,
        connectTimeout: TYPEORM_CONSTANTS.CONNECT_TIMEOUT,
        requestTimeout: TYPEORM_CONSTANTS.REQUEST_TIMEOUT,
        enableArithAbort: true,
      },
    };
  }
}
