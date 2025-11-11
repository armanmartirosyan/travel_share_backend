import { APIError } from "../../../src/errors/api.error";
import { TestSetuper } from "../tests.setuper";
import type { ExceptionCases } from "./auth.service";
import type { RequestBody } from "../../../src/types";

const testSetuper = new TestSetuper();

const baseRegBody: RequestBody.Registration = {
  username: "username",
  email: "email@example.com",
  name: "name",
  surname: "surname",
  password: "password",
  passwordConfirm: "password",
};

const baseLoginBody: RequestBody.Login = {
  email: "email@email.com",
  password: "password",
};

const AUTH_REG_EXCEPTION_CASES: ExceptionCases<RequestBody.Registration, typeof APIError> = [
  {
    name: "throws when email already exists",
    body: { ...baseRegBody, email: "taken@example.com" },
    setup: null,
    instance: APIError,
    errors: "Email is already taken",
  },
  {
    name: "throws when username already exists",
    body: { ...baseRegBody, username: "takenusername" },
    setup: null,
    instance: APIError,
    errors: "Username is already taken",
  },
  {
    name: "throws when passwords do not match",
    body: { ...baseRegBody, passwordConfirm: "no-match" },
    setup: null,
    instance: APIError,
    errors: "Passwrods do no match",
  },
];

const AUTH_LOGIN_EXCEPTION_CASES: ExceptionCases<RequestBody.Login, typeof APIError> = [
  {
    name: "too many requests",
    body: { ...baseLoginBody, email: "taken@example.com" },
    setup: (): void => {
      testSetuper.redisService.get.mockResolvedValueOnce("5");
    },
    instance: APIError,
    errors: "Too many failed login attempts. Try again later.",
  },
  {
    name: "no such user",
    body: { ...baseLoginBody, email: "email@email.ru" },
    setup: null,
    instance: APIError,
    errors: "Invalid credentials",
  },
  {
    name: "wrong password",
    body: { password: "wrongPassword", email: "taken@example.com" },
    setup: null,
    instance: APIError,
    errors: "Invalid credentials",
  },
];

const AUTH_USER_ACTIVATE_EXCEPTION_CASES: ExceptionCases<RequestBody.Activate, typeof APIError> = [
  {
    name: "invalid link should throw NoFound",
    body: { link: "invalid link" },
    setup: null,
    instance: APIError,
    errors: "Invalid activation link",
  },
  {
    name: "correct link no user should throw ",
    body: { link: "noUserLink" },
    setup: null,
    instance: APIError,
    errors: "Contact support for assistance",
  },
];

export {
  testSetuper,
  AUTH_REG_EXCEPTION_CASES,
  AUTH_LOGIN_EXCEPTION_CASES,
  AUTH_USER_ACTIVATE_EXCEPTION_CASES,
};
