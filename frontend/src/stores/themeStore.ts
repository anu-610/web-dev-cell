import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type HeroTheme = 'aurora' | 'mesh' | 'circuit'

interface ThemeState {
  heroTheme: HeroTheme
  setHeroTheme: (theme: HeroTheme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      heroTheme: 'aurora',
      setHeroTheme: (heroTheme) => set({ heroTheme }),
    }),
    { name: 'wdc_hero_theme' }
  )
)
