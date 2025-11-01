import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService, type LoginCredentials, type RegisterUserData } from '@/services/authService'
import { toast } from '@/hooks/use-toast'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: 'event_creator' | 'customer' | 'website_owner'
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (userData: RegisterUserData) => Promise<void>
  logout: () => Promise<void>
  setLoading: (loading: boolean) => void
  refreshToken: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true })
        try {
          const response = await authService.login(credentials)
          set({
            user: {
              ...response.user,
              role: response.user.role as 'event_creator' | 'customer' | 'website_owner'
            },
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          })
          toast({ title: 'Login successful!' })
        } catch (error: any) {
          set({ isLoading: false })
          const errorMessage = error.response?.data?.message || error.message || 'Login failed'
          toast({
            title: 'Login failed',
            description: errorMessage,
            variant: 'destructive'
          })
          throw error
        }
      },

      register: async (userData: RegisterUserData) => {
        set({ isLoading: true })
        try {
          const response = await authService.register(userData)
          set({
            user: {
              ...response.user,
              role: response.user.role as 'event_creator' | 'customer' | 'website_owner'
            },
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          })
          toast({ title: 'Registration successful!' })
        } catch (error: any) {
          set({ isLoading: false })
          const errorMessage = error.response?.data?.message || error.message || 'Registration failed'
          toast({
            title: 'Registration failed',
            description: errorMessage,
            variant: 'destructive'
          })
          throw error
        }
      },

      logout: async () => {
        try {
          await authService.logout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
          toast({ title: 'Logged out successfully' })
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      refreshToken: async () => {
        try {
          const response = await authService.refreshToken()
          set({ token: response.token })
        } catch (error) {
          console.error('Token refresh error:', error)
          // If refresh fails, log out the user
          get().logout()
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)