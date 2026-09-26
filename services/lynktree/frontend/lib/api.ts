import { api, setAccessToken } from './axios';
import { LinkItem, User } from './types';

function unwrap<T>(promise: Promise<{ data: { data: T } }>): Promise<T> {
  return promise.then((res) => res.data.data);
}

export const authApi = {
  signup: (email: string, password: string) =>
    unwrap<{ email: string }>(api.post('/auth/signup', { email, password })),

  verifyOtp: (email: string, code: string, purpose: 'signup' | 'login' | 'reset_password' = 'signup') =>
    unwrap<{ accessToken: string; user: User }>(api.post('/auth/verify-otp', { email, code, purpose })).then(
      (result) => {
        setAccessToken(result.accessToken);
        return result;
      }
    ),

  resendOtp: (email: string, purpose: 'signup' | 'login' | 'reset_password' = 'signup') =>
    unwrap<null>(api.post('/auth/resend-otp', { email, purpose })),

  login: (email: string, password: string) =>
    unwrap<{ accessToken: string; user: User }>(api.post('/auth/login', { email, password })).then((result) => {
      setAccessToken(result.accessToken);
      return result;
    }),

  logout: () => unwrap<null>(api.post('/auth/logout')).then(() => setAccessToken(null)),

  forgotPassword: (email: string) => unwrap<null>(api.post('/auth/forgot-password', { email })),

  resetPassword: (email: string, code: string, password: string) =>
    unwrap<null>(api.post('/auth/reset-password', { email, code, password })),

  me: () => unwrap<{ user: User }>(api.get('/auth/me')),
};

export const userApi = {
  checkUsername: (username: string) =>
    unwrap<{ available: boolean }>(api.get('/users/check-username', { params: { username } })),

  setUsername: (username: string) =>
    unwrap<{ user: User }>(api.post('/users/username', { username })),

  updateProfile: (body: Partial<Pick<User, 'displayName' | 'bio' | 'avatarUrl'>>) =>
    unwrap<{ user: User }>(api.patch('/users/me', body)),
};

export const linksApi = {
  list: () => unwrap<{ links: LinkItem[] }>(api.get('/links')),

  create: (body: { type: 'link' | 'pdf'; title: string; url: string; thumbnailUrl?: string }) =>
    unwrap<{ link: LinkItem }>(api.post('/links', body)),

  update: (id: string, body: Partial<{ title: string; url: string; thumbnailUrl: string; isActive: boolean }>) =>
    unwrap<{ link: LinkItem }>(api.patch(`/links/${id}`, body)),

  remove: (id: string) => unwrap<null>(api.delete(`/links/${id}`)),

  reorder: (order: { id: string; order: number }[]) =>
    unwrap<{ links: LinkItem[] }>(api.put('/links/reorder', { order })),
};

export const uploadApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return unwrap<{ url: string; publicId: string; isPdf: boolean }>(
      api.post('/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    );
  },
};

export const publicApi = {
  getProfile: (username: string) =>
    unwrap<{
      profile: { username: string; displayName: string; bio: string; avatarUrl: string };
      links: { id: string; type: 'link' | 'pdf'; title: string; url: string; thumbnailUrl: string }[];
    }>(api.get(`/public/${username}`)),

  trackClick: (username: string, linkId: string) =>
    api.post(`/public/${username}/links/${linkId}/click`).catch(() => {}),
};
