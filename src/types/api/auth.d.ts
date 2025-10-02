export type ApiResponse<T> = {
  success: boolean;
  message: string;
  code: string;
  data?: T;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};
