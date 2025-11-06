import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // Configuración de la aplicación
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .required()
    .messages({
      'any.required': 'NODE_ENV es requerido',
      'any.only': 'NODE_ENV debe ser development, production o test',
    }),
  PORT: Joi.number().port().required().messages({
    'any.required': 'PORT es requerido',
    'number.base': 'PORT debe ser un número',
    'number.port': 'PORT debe ser un puerto válido (1-65535)',
  }),
  HOST: Joi.string().optional().default('localhost').messages({
    'string.base': 'HOST debe ser una cadena de texto',
  }),

  // Configuración de base de datos
  DB_HOST: Joi.string().required().messages({
    'any.required': 'DB_HOST es requerido',
    'string.base': 'DB_HOST debe ser una cadena de texto',
  }),
  DB_PORT: Joi.number().port().required().messages({
    'any.required': 'DB_PORT es requerido',
    'number.base': 'DB_PORT debe ser un número',
    'number.port': 'DB_PORT debe ser un puerto válido (1-65535)',
  }),
  DB_USERNAME: Joi.string().required().messages({
    'any.required': 'DB_USERNAME es requerido',
    'string.base': 'DB_USERNAME debe ser una cadena de texto',
  }),
  DB_PASSWORD: Joi.string().required().messages({
    'any.required': 'DB_PASSWORD es requerido',
    'string.base': 'DB_PASSWORD debe ser una cadena de texto',
  }),
  DB_DATABASE: Joi.string().required().messages({
    'any.required': 'DB_DATABASE es requerido',
    'string.base': 'DB_DATABASE debe ser una cadena de texto',
  }),
  DB_ENCRYPT: Joi.string().valid('true', 'false').default('false').messages({
    'any.only': 'DB_ENCRYPT debe ser "true" o "false"',
  }),
});
