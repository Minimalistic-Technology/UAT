export interface User {
  id: string;
  email: string;
  username: string | null;
  displayName: string;
  bio: string;
  avatarUrl: string;
  isVerified: boolean;
  usernameSet: boolean;
}

export interface LinkItem {
  _id: string;
  id?: string;
  type: 'link' | 'pdf';
  title: string;
  url: string;
  thumbnailUrl: string;
  order: number;
  isActive: boolean;
  clickCount: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  details?: { path: string; message: string }[];
}
