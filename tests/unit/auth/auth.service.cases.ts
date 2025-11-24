import { APIError } from "../../../src/errors/api.error";
import { TestSetuper } from "../tests.setuper";
import type { ExceptionCases } from "./auth.service";
import type { AuthRequestBody } from "../../../src/types";

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

const AUTH_REG_EXCEPTION_CASES: ExceptionCases<AuthRequestBody.Registration, typeof APIError> = [
  {
    name: "throws when email already exists",
    body: { ...baseRegBody, email: "taken@example.com" },
    message: "Bad Request",
    setup: null,
    instance: APIError,
    errors: "Email is already taken",
  },
  {
    name: "throws when username already exists",
    body: { ...baseRegBody, username: "takenusername" },
    message: "Bad Request",
    setup: null,
    instance: APIError,
    errors: "Username is already taken",
  },
  {
    name: "throws when passwords do not match",
    body: { ...baseRegBody, passwordConfirm: "no-match" },
    message: "Bad Request",
    setup: null,
    instance: APIError,
    errors: "Passwrods do no match",
  },
];

const AUTH_LOGIN_EXCEPTION_CASES: ExceptionCases<AuthRequestBody.Login, typeof APIError> = [
  {
    name: "too many requests",
    body: baseLoginBody,
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
    message: "Bad Request",
    setup: null,
    instance: APIError,
    errors: "Invalid credentials",
  },
  {
    name: "wrong password",
    body: { password: "wrongPassword", login: "taken@example.com" },
    message: "Bad Request",
    setup: null,
    instance: APIError,
    errors: "Invalid credentials",
  },
];

const AUTH_USER_ACTIVATE_EXCEPTION_CASES: ExceptionCases<
  AuthRequestBody.Activate,
  typeof APIError
> = [
    {
      name: "invalid link should throw NoFound",
      body: { link: "invalid link" },
      message: "Not Found",
      setup: null,
      instance: APIError,
      errors: "Invalid activation link",
    },
    {
      name: "correct link no user should throw ",
      body: { link: "noUser" },
      message: "Internal Server Error",
      setup: null,
      instance: APIError,
      errors: "Contact support for assistance",
    },
  ];

const AUTH_USER_REFRESH_EXCEPTION_CASES: ExceptionCases<
  { refreshToken: string | undefined },
  typeof APIError
> = [
    {
      name: "no refresh token provided should throw",
      body: { refreshToken: undefined },
      message: "User is not authorized.",
      setup: null,
      instance: APIError,
      errors: undefined,
    },
    {
      name: "no refresh token in database should throw",
      body: { refreshToken: "refreshTokenNotInDb" },
      message: "User is not authorized.",
      setup: null,
      instance: APIError,
      errors: undefined,
    },
    {
      name: "no user with such id",
      body: { refreshToken: "tokenNoUser" },
      message: "User is not authorized.",
      setup: null,
      instance: APIError,
      errors: undefined,
    },
  ];

const AUTH_FORGOT_PASSWORD_EXCEPTION_CASES: ExceptionCases<
  AuthRequestBody.ForgotPassword,
  typeof APIError
> = [
    {
      name: "invalid mail format",
      body: { email: "notValidEmail" },
      message: "Bad Request",
      setup: null,
      instance: APIError,
      errors: "Invalid Email Address",
    },
  ];

export {
  testSetuper,
  AUTH_REG_EXCEPTION_CASES,
  AUTH_LOGIN_EXCEPTION_CASES,
  AUTH_USER_ACTIVATE_EXCEPTION_CASES,
  AUTH_USER_REFRESH_EXCEPTION_CASES,
  AUTH_FORGOT_PASSWORD_EXCEPTION_CASES,
};
