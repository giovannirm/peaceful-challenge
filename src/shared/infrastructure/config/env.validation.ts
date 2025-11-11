import * as Joi from 'joi';
import { INFRASTRUCTURE_CONSTANTS } from '@shared/infrastructure/constants/app.constants';
import { ENV_VARIABLES } from '@shared/infrastructure/constants/env-variables.constants';
import { VALIDATION_MESSAGES } from '@shared/infrastructure/constants/validation-messages.constants';

const validEnvironments = `${INFRASTRUCTURE_CONSTANTS.ENVIRONMENT.DEVELOPMENT}, ${INFRASTRUCTURE_CONSTANTS.ENVIRONMENT.PRODUCTION} o ${INFRASTRUCTURE_CONSTANTS.ENVIRONMENT.TEST}`;
const validBooleanValues = `"${INFRASTRUCTURE_CONSTANTS.BOOLEAN.TRUE}" o "${INFRASTRUCTURE_CONSTANTS.BOOLEAN.FALSE}"`;

export const envValidationSchema = Joi.object({
  // Configuración de la aplicación
  [ENV_VARIABLES.NODE_ENV]: Joi.string()
    .valid(
      INFRASTRUCTURE_CONSTANTS.ENVIRONMENT.DEVELOPMENT,
      INFRASTRUCTURE_CONSTANTS.ENVIRONMENT.PRODUCTION,
      INFRASTRUCTURE_CONSTANTS.ENVIRONMENT.TEST,
    )
    .required()
    .messages({
      'any.required': VALIDATION_MESSAGES.NODE_ENV_REQUIRED,
      'any.only': VALIDATION_MESSAGES.NODE_ENV_INVALID(validEnvironments),
    }),
  [ENV_VARIABLES.PORT]: Joi.number().port().required().messages({
    'any.required': VALIDATION_MESSAGES.PORT_REQUIRED,
    'number.base': VALIDATION_MESSAGES.PORT_INVALID_NUMBER,
    'number.port': VALIDATION_MESSAGES.PORT_INVALID_RANGE,
  }),
  [ENV_VARIABLES.HOST]: Joi.string()
    .optional()
    .default(String(INFRASTRUCTURE_CONSTANTS.HOST.LOCALHOST))
    .messages({
      'string.base': VALIDATION_MESSAGES.HOST_INVALID_STRING,
    }),

  // Configuración de base de datos
  [ENV_VARIABLES.DB_HOST]: Joi.string().required().messages({
    'any.required': VALIDATION_MESSAGES.DB_HOST_REQUIRED,
    'string.base': VALIDATION_MESSAGES.DB_HOST_INVALID_STRING,
  }),
  [ENV_VARIABLES.DB_PORT]: Joi.number().port().required().messages({
    'any.required': VALIDATION_MESSAGES.DB_PORT_REQUIRED,
    'number.base': VALIDATION_MESSAGES.DB_PORT_INVALID_NUMBER,
    'number.port': VALIDATION_MESSAGES.DB_PORT_INVALID_RANGE,
  }),
  [ENV_VARIABLES.DB_USERNAME]: Joi.string().required().messages({
    'any.required': VALIDATION_MESSAGES.DB_USERNAME_REQUIRED,
    'string.base': VALIDATION_MESSAGES.DB_USERNAME_INVALID_STRING,
  }),
  [ENV_VARIABLES.DB_PASSWORD]: Joi.string().required().messages({
    'any.required': VALIDATION_MESSAGES.DB_PASSWORD_REQUIRED,
    'string.base': VALIDATION_MESSAGES.DB_PASSWORD_INVALID_STRING,
  }),
  [ENV_VARIABLES.DB_DATABASE]: Joi.string().required().messages({
    'any.required': VALIDATION_MESSAGES.DB_DATABASE_REQUIRED,
    'string.base': VALIDATION_MESSAGES.DB_DATABASE_INVALID_STRING,
  }),
  [ENV_VARIABLES.DB_ENCRYPT]: Joi.string()
    .valid(
      INFRASTRUCTURE_CONSTANTS.BOOLEAN.TRUE,
      INFRASTRUCTURE_CONSTANTS.BOOLEAN.FALSE,
    )
    .default(INFRASTRUCTURE_CONSTANTS.BOOLEAN.FALSE)
    .messages({
      'any.only': VALIDATION_MESSAGES.DB_ENCRYPT_INVALID(validBooleanValues),
    }),

  // Configuración de Azure Service Bus (opcional)
  [ENV_VARIABLES.AZURE_SERVICE_BUS_CONNECTION_STRING]: Joi.string()
    .optional()
    .messages({
      'string.base':
        VALIDATION_MESSAGES.AZURE_SERVICE_BUS_CONNECTION_STRING_INVALID_STRING,
    }),
  [ENV_VARIABLES.AZURE_SERVICE_BUS_QUEUE_NAME]: Joi.string()
    .optional()
    .messages({
      'string.base':
        VALIDATION_MESSAGES.AZURE_SERVICE_BUS_QUEUE_NAME_INVALID_STRING,
    }),
});
