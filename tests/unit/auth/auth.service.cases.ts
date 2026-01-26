import { APIError } from "../../../src/errors/api.error";
import { TestSetuper } from "../tests.setuper";
import type { ExceptionCases } from "./auth.service";
import type { AuthParams, AuthRequestBody } from "../../../src/types";

const testSetuper = new TestSetuper();

const baseRegBody: AuthRequestBody.Registration = {
  username: "username",
  email: "email@example.com",
  name: "name",
  surname: "surname",
  password: "password",
  passwordConfirm: "password",
};

const baseLoginBody: AuthRequestBody.Login = {
  login: "email@email.com",
  password: "password",
};

const AUTH_REG_EXCEPTION_CASES: ExceptionCases<
  AuthRequestBody.Registration,
  typeof APIError,
  null
> = [
  {
    name: "throws when email already exists",
    body: { ...baseRegBody, email: "taken@example.com" },
    params: null,
    message: "Bad Request",
    setup: null,
    instance: APIError,
    errors: "Email is already taken",
  },
  {
    name: "throws when username already exists",
    body: { ...baseRegBody, username: "takenusername" },
    params: null,
    message: "Bad Request",
    setup: null,
    instance: APIError,
    errors: "Username is already taken",
  },
  {
    name: "throws when passwords do not match",
    body: { ...baseRegBody, passwordConfirm: "no-match" },
    params: null,
    message: "Bad Request",
    setup: null,
    instance: APIError,
    errors: "Passwrods do no match",
  },
];

const AUTH_LOGIN_EXCEPTION_CASES: ExceptionCases<AuthRequestBody.Login, typeof APIError, null> = [
  {
    name: "too many requests",
    body: baseLoginBody,
    params: null,
    message: "Too Many Requests",
    setup: (): void => {
      testSetuper.redisService.get.mockResolvedValueOnce("5");
    },
    instance: APIError,
    errors: "Too many failed login attempts. Try again later.",
  },
  {
    name: "no such user",
    body: baseLoginBody,
    params: null,
    message: "Bad Request",
    setup: null,
    instance: APIError,
    errors: "Invalid credentials",
  },
  {
    name: "wrong password",
    body: { password: "wrongPassword", login: "taken@example.com" },
    params: null,
    message: "Bad Request",
    setup: null,
    instance: APIError,
    errors: "Invalid credentials",
  },
];

const AUTH_USER_ACTIVATE_EXCEPTION_CASES: ExceptionCases<
  null,
  typeof APIError,
  AuthParams.Activate
> = [
  {
    name: "invalid link should throw NoFound",
    body: null,
    params: { link: "invalid link" },
    message: "Not Found",
    setup: null,
    instance: APIError,
    errors: "Invalid activation link",
  },
  {
    name: "correct link no user should throw ",
    body: null,
    params: { link: "noUser" },
    message: "Internal Server Error",
    setup: null,
    instance: APIError,
    errors: "Contact support for assistance",
  },
];

const AUTH_USER_REFRESH_EXCEPTION_CASES: ExceptionCases<
  { refreshToken: string | undefined },
  typeof APIError,
  null
> = [
  {
    name: "no refresh token provided should throw",
    body: { refreshToken: undefined },
    params: null,
    message: "User is not authorized.",
    setup: null,
    instance: APIError,
    errors: undefined,
  },
  {
    name: "no refresh token in database should throw",
    body: { refreshToken: "refreshTokenNotInDb" },
    params: null,
    message: "User is not authorized.",
    setup: null,
    instance: APIError,
    errors: undefined,
  },
  {
    name: "no user with such id",
    body: { refreshToken: "tokenNoUser" },
    params: null,
    message: "User is not authorized.",
    setup: null,
    instance: APIError,
    errors: undefined,
  },
];

const AUTH_FORGOT_PASSWORD_EXCEPTION_CASES: ExceptionCases<
  AuthRequestBody.ForgotPassword,
  typeof APIError,
  null
> = [
  {
    name: "invalid mail format",
    body: { email: "notValidEmail" },
    params: null,
    message: "Bad Request",
    setup: null,
    instance: APIError,
    errors: "Invalid Email Address",
  },
];

const AUTH_RESET_PASSWORD_EXCEPTION_CASES: ExceptionCases<
  AuthRequestBody.ResetPassword,
  typeof APIError,
  AuthParams.ResetPassword
> = [
  {
    name: "should no find any token",
    body: { password: "password", passwordConfirm: "password" },
    params: { token: "someToken" },
    message: "Not Found",
    setup: null,
    instance: APIError,
    errors: "Invalid or expired reset token.",
  },
  {
    name: "passwords do no match",
    body: { password: "password", passwordConfirm: "notPassword" },
    params: { token: "someToken" },
    message: "Bad Request",
    setup: (): void => {
      testSetuper.redisService.get.mockResolvedValueOnce("example@example.com");
    },
    instance: APIError,
    errors: "Passwrods do no match.",
  },
  {
    name: "user not found",
    body: { password: "password", passwordConfirm: "password" },
    params: { token: "someToken" },
    message: "Not Found",
    setup: (): void => {
      testSetuper.redisService.get.mockResolvedValueOnce("tokenNoUser");
    },
    instance: APIError,
    errors: "User not found.",
  },
  {
    name: "same as old password",
    body: { password: "samePassword", passwordConfirm: "samePassword" },
    params: { token: "someToken" },
    message: "Bad Request",
    setup: (): void => {
      testSetuper.redisService.get.mockResolvedValueOnce("example@example.com");
    },
    instance: APIError,
    errors: "The password cannot be the same as the old one.",
  },
];

const AUTH_UPLOAD_PICTURE_EXCEPTION_CASES: ExceptionCases<
  { userId: string | undefined; file: string | undefined },
  typeof APIError,
  null
> = [
  {
    name: "no file uploaded",
    body: { userId: "noUser", file: undefined },
    message: "Bad Request",
    params: null,
    setup: null,
    instance: APIError,
    errors: "No file uploaded.",
  },
  {
    name: "no user id",
    body: { userId: undefined, file: "commonFilename.png" },
    message: "User is not authorized.",
    params: null,
    setup: null,
    instance: APIError,
    errors: undefined,
  },
  {
    name: "user is not authorized",
    body: { userId: "noUser", file: "commonFilename.png" },
    message: "Not Found",
    params: null,
    setup: null,
    instance: APIError,
    errors: "User not found.",
  },
];

const AUTH_UPDATE_EXCEPTION_CASES: ExceptionCases<
  { userId?: string } & AuthRequestBody.UpdateUser,
  typeof APIError,
  null
> = [
  {
    name: "no user id",
    body: {},
    message: "User is not authorized.",
    params: null,
    setup: null,
    instance: APIError,
    errors: undefined,
  },
  {
    name: "no user with given id",
    body: { userId: "noUser" },
    message: "User is not authorized.",
    params: null,
    setup: null,
    instance: APIError,
    errors: undefined,
  },
  {
    name: "username is taken",
    body: { userId: "User", username: "takenusername" },
    message: "Bad Request",
    params: null,
    setup: null,
    instance: APIError,
    errors: "Username is already taken",
  },
  {
    name: "email is taken",
    body: { userId: "User", username: "username", email: "taken@example.com" },
    message: "Bad Request",
    params: null,
    setup: null,
    instance: APIError,
    errors: "Email is already taken",
  },
  {
    name: "passwords do not match",
    body: {
      userId: "User",
      username: "username",
      email: "example@example.com",
      currentPassword: "password",
      newPassword: "newPassword",
      confirmPassword: "confirmPassword",
    },
    message: "Bad Request",
    params: null,
    setup: null,
    instance: APIError,
    errors: "Passwords do not match",
  },
];

export {
  testSetuper,
  AUTH_REG_EXCEPTION_CASES,
  AUTH_LOGIN_EXCEPTION_CASES,
  AUTH_USER_ACTIVATE_EXCEPTION_CASES,
  AUTH_USER_REFRESH_EXCEPTION_CASES,
  AUTH_FORGOT_PASSWORD_EXCEPTION_CASES,
  AUTH_RESET_PASSWORD_EXCEPTION_CASES,
  AUTH_UPLOAD_PICTURE_EXCEPTION_CASES,
  AUTH_UPDATE_EXCEPTION_CASES,
};
