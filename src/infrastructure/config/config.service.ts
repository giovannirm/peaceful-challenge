import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INFRASTRUCTURE_CONSTANTS } from '../constants/app.constants';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {
    // Validar que todas las variables requeridas estén presentes
    this.validateRequiredVariables();
  }

  private validateRequiredVariables(): void {
    const requiredVars = [
      'NODE_ENV',
      'PORT',
      'DB_HOST',
      'DB_PORT',
      'DB_USERNAME',
      'DB_PASSWORD',
      'DB_DATABASE',
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
        `Las siguientes variables de entorno son requeridas pero no están definidas: ${missingVars.join(', ')}`,
      );
    }
  }

  // Configuración de la aplicación
  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV')!;
  }

  get port(): number {
    return this.configService.get<number>('PORT')!;
  }

  get host(): string {
    return this.configService.get<string>(
      'HOST',
      INFRASTRUCTURE_CONSTANTS.HOST.LOCALHOST,
    );
  }

  // Configuración de base de datos
  get dbHost(): string {
    return this.configService.get<string>('DB_HOST')!;
  }

  get dbPort(): number {
    return this.configService.get<number>('DB_PORT')!;
  }

  get dbUsername(): string {
    return this.configService.get<string>('DB_USERNAME')!;
  }

  get dbPassword(): string {
    return this.configService.get<string>('DB_PASSWORD')!;
  }

  get dbDatabase(): string {
    return this.configService.get<string>('DB_DATABASE')!;
  }

  get dbEncrypt(): boolean {
    return (
      this.configService.get<string>(
        'DB_ENCRYPT',
        INFRASTRUCTURE_CONSTANTS.BOOLEAN.FALSE,
      ) === INFRASTRUCTURE_CONSTANTS.BOOLEAN.TRUE
    );
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
      },
    };
  }
}
