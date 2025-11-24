import nodeMailer from "nodemailer";
import { Logger } from "../common/logger.js";
import { Env } from "../config/env.config.js";
import type { ValidatedEnv } from "../types/index.js";
import type SMTPTransport from "nodemailer";
import type { SendMailOptions } from "nodemailer";

class MailService {
  private readonly _transporter: nodeMailer.Transporter<SMTPTransport.SentMessageInfo>;
  private readonly _env: ValidatedEnv;
  private readonly _logger: Logger;
  private readonly _appName: string;

  constructor() {
    this._appName = "Travel Share";
    this._env = Env.instance.env;
    this._logger = new Logger("Mail");
    this._transporter = nodeMailer.createTransport({
      host: this._env.SMTP_HOST,
      port: this._env.SMTP_PORT,
      secure: true,
      auth: {
        user: this._env.SMTP_USERNAME,
        pass: this._env.SMTP_PASSWORD,
      },
    });
  }

  public async sendActivationMail(to: string, link: string): Promise<void> {
    return await this.sendMail({
      from: this._env.SMTP_USERNAME,
      to,
      subject: "Activate Your Account",
      text: `Hello,

      Welcome to ${this._appName}! To activate your account, please click the link below or copy it into your browser:

      ${link}

      This link will expire in 24 hours. If you did not sign up for an account, you can safely ignore this email.

      Thanks,
      ${this._appName} Team`,
      html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; line-height: 1.5; color: #333;">
              <h2 style="color: #4CAF50;">Welcome to ${this._appName}!</h2>
              <p>Hello,</p>
              <p>Thank you for signing up! To activate your account, please click the button below:</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${link}" 
                  style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Activate Account
                </a>
              </p>
              <p>If the button does not work, copy and paste the following link into your browser:</p>
              <p style="word-break: break-all;"><a href="${link}">${link}</a></p>
              <p style="font-size: 12px; color: #777;">
                This link will expire in 24 hours. If you did not sign up for an account, please ignore this email.
              </p>
              <p>Thanks,<br>${this._appName} Team</p>
            </div>
          `,
    });
  }

  public async sendForgotPasswordMail(to: string, link: string): Promise<void> {
    return await this.sendMail({
      from: this._env.SMTP_USERNAME,
      to,
      subject: "Reset Your Password",
      text: `Hello,

    We received a request to reset the password for your ${this._appName} account. 

    To reset your password, click the link below or copy it into your browser:

    ${link}

    This link will expire in 15 minutes. If you did not request a password reset, you can safely ignore this email.

    Thanks,
    ${this._appName} Team`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; line-height: 1.5; color: #333;">
        <h2 style="color: #4CAF50;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset the password for your ${this._appName} account.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${link}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>If the button does not work, copy and paste the following link into your browser:</p>
        <p style="word-break: break-all;"><a href="${link}">${link}</a></p>
        <p style="font-size: 12px; color: #777;">
          This link will expire in 15 minutes. If you did not request a password reset, you can safely ignore this email.
        </p>
        <p>Thanks,<br>${this._appName} Team</p>
      </div>
    `,
    });
  }

  private async sendMail(mailOptions: SendMailOptions): Promise<void> {
    if (!this._env.MAIL_SERVICE) return;
    try {
      await this._transporter.sendMail(mailOptions);
    } catch (error: unknown) {
      this._logger.warn(error);
    }
  }
}

export { MailService };
