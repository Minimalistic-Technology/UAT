export interface AuthUser {
  _id: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface TokenResponseData {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponseData {
  user: AuthUser;
  tokens: TokenResponseData;
}

export interface SignupResponseData {
  user: AuthUser;
  tokens: TokenResponseData;
}

export interface PasswordResetInitResponse {
  resetToken?: string;
}

export type LoginResponse = ApiResponse<LoginResponseData>;
export type SignupResponse = ApiResponse<SignupResponseData>;
export type RefreshTokenResponse = ApiResponse<TokenResponseData>;
export type PasswordResetResponse = ApiResponse<PasswordResetInitResponse | null>;
