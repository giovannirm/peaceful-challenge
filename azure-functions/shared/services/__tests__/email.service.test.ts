import { EmailService } from '../email.service';
import { EMAIL_CONSTANTS } from '../../constants/email.constants';
import * as nodemailer from 'nodemailer';

// Mock de nodemailer
jest.mock('nodemailer');

describe('EmailService', () => {
  let emailService: EmailService;
  let mockTransporter: any;

  beforeEach(() => {
    // Configurar variables de entorno
    process.env.EMAIL_USER = 'test@example.com';
    process.env.EMAIL_APP_PASSWORD = 'test-password';

    // Mock del transporter
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({
        messageId: 'test-message-id',
        response: '250 OK',
      }),
      verify: jest.fn().mockResolvedValue(true),
    };

    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('debe crear el transporter con las credenciales correctas', () => {
      emailService = new EmailService();

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: EMAIL_CONSTANTS.SMTP.GMAIL_HOST,
        port: EMAIL_CONSTANTS.SMTP.GMAIL_PORT,
        secure: false,
        auth: {
          user: 'test@example.com',
          pass: 'test-password',
        },
      });
    });

    it('debe lanzar error si falta EMAIL_USER', () => {
      delete process.env.EMAIL_USER;

      expect(() => new EmailService()).toThrow(
        'EMAIL_USER y EMAIL_APP_PASSWORD deben estar configurados en las variables de entorno',
      );

      // Restaurar para otros tests
      process.env.EMAIL_USER = 'test@example.com';
    });

    it('debe lanzar error si falta EMAIL_APP_PASSWORD', () => {
      delete process.env.EMAIL_APP_PASSWORD;

      expect(() => new EmailService()).toThrow(
        'EMAIL_USER y EMAIL_APP_PASSWORD deben estar configurados en las variables de entorno',
      );

      // Restaurar para otros tests
      process.env.EMAIL_APP_PASSWORD = 'test-password';
    });
  });

  describe('sendEmail', () => {
    beforeEach(() => {
      emailService = new EmailService();
    });

    it('debe enviar un email correctamente', async () => {
      const to = 'recipient@example.com';
      const subject = 'Test Subject';
      const text = 'Test body';
      const html = '<p>Test body</p>';

      await emailService.sendEmail(to, subject, text, html);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'test@example.com',
        to,
        subject,
        text,
        html,
      });
    });

    it('debe enviar email sin HTML si no se proporciona', async () => {
      const to = 'recipient@example.com';
      const subject = 'Test Subject';
      const text = 'Test body';

      await emailService.sendEmail(to, subject, text);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'test@example.com',
        to,
        subject,
        text,
        html: undefined,
      });
    });

    it('debe lanzar error si falta EMAIL_USER al enviar', async () => {
      delete process.env.EMAIL_USER;

      await expect(
        emailService.sendEmail('to@example.com', 'Subject', 'Body'),
      ).rejects.toThrow('EMAIL_USER no está configurado');

      // Restaurar
      process.env.EMAIL_USER = 'test@example.com';
    });

    it('debe manejar errores de nodemailer y lanzar error descriptivo', async () => {
      const error = new Error('SMTP connection failed');
      mockTransporter.sendMail.mockRejectedValueOnce(error);

      await expect(
        emailService.sendEmail(
          'to@example.com',
          'Subject',
          'Body',
          '<p>Body</p>',
        ),
      ).rejects.toThrow('Error al enviar correo: SMTP connection failed');
    });

    it('debe convertir errores no-Error a string', async () => {
      mockTransporter.sendMail.mockRejectedValueOnce('String error');

      await expect(
        emailService.sendEmail('to@example.com', 'Subject', 'Body'),
      ).rejects.toThrow('Error al enviar correo: String error');
    });
  });

  describe('verifyConnection', () => {
    beforeEach(() => {
      emailService = new EmailService();
    });

    it('debe retornar true si la conexión es exitosa', async () => {
      const result = await emailService.verifyConnection();

      expect(result).toBe(true);
      expect(mockTransporter.verify).toHaveBeenCalledTimes(1);
    });

    it('debe retornar false si la conexión falla', async () => {
      mockTransporter.verify.mockRejectedValueOnce(
        new Error('Connection failed'),
      );

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await emailService.verifyConnection();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error al verificar conexión SMTP:',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });
});

