import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiFetch } from '@/lib/api'

export type HeroTheme = 'aurora' | 'mesh' | 'circuit'

interface ThemeState {
  heroTheme: HeroTheme
  /** Admin action: sets theme locally AND persists to DB for all visitors. */
  setHeroTheme: (theme: HeroTheme) => Promise<void>
  /** Called on app mount: fetches the DB-authoritative theme and hydrates store. */
  fetchTheme: () => Promise<void>
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      heroTheme: 'aurora',

      setHeroTheme: async (theme) => {
        set({ heroTheme: theme }) // optimistic
        try {
          await apiFetch('/settings/theme', { method: 'PUT', data: { theme } })
        } catch (err) {
          console.error('[themeStore] failed to persist theme to server:', err)
        }
      },

      fetchTheme: async () => {
        try {
          const data = await apiFetch<{ theme: HeroTheme }>('/settings/theme')
          set({ heroTheme: data.theme })
        } catch {
          // Server unreachable — keep whatever is in localStorage
        }
      },
    }),
    {
      name: 'wdc_hero_theme',
      // Only persist the theme value, not the actions
      partialize: (state) => ({ heroTheme: state.heroTheme }),
    }
  )
)
