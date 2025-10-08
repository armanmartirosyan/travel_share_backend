import type { AuthResponse } from "../types/index.js";

class FakeData {
  static getAuthRegistration(): AuthResponse {
    return {
      user: {
        username: "username",
        email: "email",
        name: "name",
        surname: "surname",
        isActive: true,
        followers: 0,
        following: 0,
        profilePicture: "picture",
      },
      accessToken: "access token",
    };
  }
}

export { FakeData };
