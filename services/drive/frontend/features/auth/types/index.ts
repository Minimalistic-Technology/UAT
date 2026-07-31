export interface User {
  _id: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterResponseData {
  email: string;
}

export interface AuthResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
}