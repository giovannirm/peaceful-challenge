import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { EMAIL_CONSTANTS } from '../constants/email.constants';

/**
 * Servicio para el envío de correos electrónicos usando nodemailer
 */
export class EmailService {
  private transporter: Transporter;

  constructor() {
    // Obtener credenciales desde variables de entorno
    const emailUser = process.env.EMAIL_USER;
    const emailAppPassword = process.env.EMAIL_APP_PASSWORD;

    if (!emailUser || !emailAppPassword) {
      throw new Error(
        'EMAIL_USER y EMAIL_APP_PASSWORD deben estar configurados en las variables de entorno',
      );
    }

    // Configurar transporter de nodemailer para Gmail
    this.transporter = nodemailer.createTransport({
      host: EMAIL_CONSTANTS.SMTP.GMAIL_HOST,
      port: EMAIL_CONSTANTS.SMTP.GMAIL_PORT,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: emailUser,
        pass: emailAppPassword,
      },
    });
  }

  /**
   * Envía un correo electrónico
   * @param to - Dirección de correo del destinatario
   * @param subject - Asunto del correo
   * @param text - Cuerpo del correo en texto plano
   * @param html - Cuerpo del correo en HTML (opcional)
   */
  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<void> {
    const emailUser = process.env.EMAIL_USER;
    if (!emailUser) {
      throw new Error('EMAIL_USER no está configurado');
    }

    const mailOptions = {
      from: emailUser,
      to,
      subject,
      text,
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Correo enviado exitosamente:', info.messageId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Error al enviar correo: ${errorMessage}`);
    }
  }

  /**
   * Verifica la conexión con el servidor SMTP
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Error al verificar conexión SMTP:', error);
      return false;
    }
  }
}
