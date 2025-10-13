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

  constructor() {
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

  async sendActivationMail(to: string, link: string): Promise<void> {
    return await this.sendMail({
      from: this._env.SMTP_USERNAME,
      to,
      subject: "Account activation",
      text: `To activate please follow the link below: ${link}`,
      html: `
				<div>
				  <h1>To activate please follow the link below.</h1>
				  <a href="${link}">${link}</a>
				</div>
			  `,
    });
  }

  private async sendMail(mailOptions: SendMailOptions): Promise<void> {
    if (!this._env.MAIL_SERVICE)
      return;
    try {
      await this._transporter.sendMail(mailOptions);
    } catch (error: unknown) {
      this._logger.warn(error);
    }
  }
}

export { MailService };
