import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface AuthState {
  token: string | null
  isAdmin: boolean
  userEmail: string | null
  userName: string | null
  loading: boolean
  setAuth: (token: string | null, isAdmin: boolean) => void
  checkSession: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAdmin: false,
  userEmail: null,
  userName: null,
  loading: true,

  setAuth: (token, isAdmin) => set({ token, isAdmin, loading: false }),

  checkSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (session && !error) {
        // Decode the JWT to safely determine roles and metadata
        const payload = JSON.parse(atob(session.access_token.split('.')[1]))
        const isAdmin = payload.app_metadata?.role === 'admin'

        set({
          token: session.access_token,
          isAdmin,
          userEmail: session.user.email || null,
          userName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
          loading: false
        })
      } else {
        set({ token: null, isAdmin: false, userEmail: null, userName: null, loading: false })
      }
    } catch (e) {
      set({ token: null, isAdmin: false, userEmail: null, userName: null, loading: false })
    }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ token: null, isAdmin: false, userEmail: null, userName: null })
  }
}))
