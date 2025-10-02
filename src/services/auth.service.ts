import type { AuthResponse } from "../types/index.js";

class AuthService {
  public async userRegistration(
    _email: string,
    _username: string,
    _password: string,
    _passwordConfirm: string,
  ): Promise<AuthResponse> {
    return {
      accessToken: "xxx",
      refreshToken: "xxx",
    };
  }
}

export { AuthService };
