import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Cookie: `token=${token.value}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getSession();
  
  if (!user) {
    redirect('/login');
  }

  if (!user.isVerified) {
    redirect('/verify');
  }

  return user;
}

export async function requireGuest() {
  const user = await getSession();
  
  if (user && user.isVerified) {
    redirect('/dashboard');
  }
}