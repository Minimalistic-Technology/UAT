import { User } from '@/features/auth/types'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

type AuthState = {
  user: Omit<User, 'createdAt' | 'updatedAt'> | null
  isAuthenticated: boolean
  setUser: (user: Omit<User, 'createdAt' | 'updatedAt'> | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,

        setUser: (user) =>
          set(
            { user, isAuthenticated: !!user },
            false,
            'auth/setUser'
          ),

        logout: () =>
          set(
            { user: null, isAuthenticated: false },
            false,
            'auth/logout'
          ),
      }),
      {
        name: 'auth-storage',
      }
    )
  )
)

export const useAuth = () => {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return { user, isAuthenticated }
}