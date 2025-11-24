import nodeMailer from "nodemailer";
import { Logger } from "../../../src/common/logger";
import { Env } from "../../../src/config/env.config";
import { MailService } from "../../../src/services/mail.service";
import { TestSetuper } from "../tests.setuper";

jest.mock("../../../src/common/logger");
jest.mock("nodemailer");

const testSetuper = new TestSetuper();

describe("MailService", (): void => {
  const sendMailMock: jest.Mock = jest.fn();
  const baseTo: string = "to@example.com";
  const baseLink: string = "http://link";

  beforeEach(() => {
    testSetuper.clearMocks();
    testSetuper.setupEnv();

    // mock transporter
    nodeMailer.createTransport = jest.fn().mockReturnValue({ sendMail: sendMailMock });
  });

  it("should not attempt to send if MAIL_SERVICE is false", async (): Promise<void> => {
    jest
      .spyOn(Env.instance, "env", "get")
      .mockReturnValue({ ...testSetuper.mockEnv(), MAIL_SERVICE: false });

    const mail = new MailService();

    await mail.sendActivationMail(baseTo, baseLink);

    expect(nodeMailer.createTransport).toHaveBeenCalled();
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("should log.warn error if send mail is failed", async (): Promise<void> => {
    const warnSpy: jest.SpyInstance = jest
      .spyOn(Logger.prototype, "warn")
      .mockImplementation((): void => { });

    const mail = new MailService();

    const err = new Error("send failed");
    sendMailMock.mockRejectedValueOnce(err);

    await mail.sendActivationMail(baseTo, baseLink);

    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({ to: baseTo }));
    expect(warnSpy).toHaveBeenCalledWith(err);
  });

  describe("sendActivationMail", (): void => {

    it("should call transporter.sendMail when MAIL_SERVICE is true", async (): Promise<void> => {
      const mail = new MailService();

      sendMailMock.mockResolvedValueOnce({ accepted: [baseTo] });

      await mail.sendActivationMail(baseTo, baseLink);

      expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({ to: baseTo }));
    });

  });


  describe("sendForgotPasswordMail", (): void => {
    it("should call transporter.sendMail when MAIL_SERVICE is true ", async (): Promise<void> => {
      const warnSpy: jest.SpyInstance = jest
        .spyOn(Logger.prototype, "warn")
        .mockImplementation((): void => { });

      const mail = new MailService();

      const err = new Error("send failed");
      sendMailMock.mockRejectedValueOnce(err);

      await mail.sendForgotPasswordMail(baseTo, baseLink);

      expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({ to: baseTo }));
      expect(warnSpy).toHaveBeenCalledWith(err);
    });
  });
});
