import { APIError } from "../../../src/errors/api.error";
import type { ExceptionCases } from "./auth.service";
import type { RequestBody } from "../../../src/types";

const bodyBase: RequestBody.Registration = {
  username: "username",
  email: "email@example.com",
  name: "name",
  surname: "surname",
  password: "password",
  passwordConfirm: "password",
};

const AUTH_REG_EXCEPTION_CASES: ExceptionCases<RequestBody.Registration, typeof APIError> = [
  {
    name: "throws when email already exists",
    body: { ...bodyBase, email: "taken@example.com" },
    instance: APIError,
    errors: "Email is already taken",
  },
  {
    name: "throws when username already exists",
    body: { ...bodyBase, username: "takenusername" },
    instance: APIError,
    errors: "Username is already taken",
  },
  {
    name: "throws when passwords do not match",
    body: { ...bodyBase, passwordConfirm: "no-match" },
    instance: APIError,
    errors: "Passwrods do no match",
  },
];

export { AUTH_REG_EXCEPTION_CASES };
