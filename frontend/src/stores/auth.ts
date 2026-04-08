import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface AuthState {
  token: string | null
  isAdmin: boolean
  loading: boolean
  setAuth: (token: string | null, isAdmin: boolean) => void
  checkSession: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAdmin: false,
  loading: true,

  setAuth: (token, isAdmin) => set({ token, isAdmin, loading: false }),

  checkSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // In a real app, you'd decode the JWT to check app_metadata.role == 'admin'
        // Or call GET /api/v1/me. For now, we rely on the backend to reject non-admins.
        set({ token: session.access_token, isAdmin: true, loading: false })
      } else {
        set({ token: null, isAdmin: false, loading: false })
      }
    } catch (e) {
      set({ token: null, isAdmin: false, loading: false })
    }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ token: null, isAdmin: false })
  }
}))
