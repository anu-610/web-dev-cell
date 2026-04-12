import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore, type HeroTheme } from '@/stores/themeStore'

const THEMES: { id: HeroTheme; label: string; icon: string }[] = [
  { id: 'aurora',  label: 'Aurora',   icon: '🌌' },
  { id: 'mesh',    label: 'Mesh',     icon: '🎨' },
  { id: 'circuit', label: 'Circuit',  icon: '⚡' },
]

export default function ThemeSwitcher() {
  const { isAdmin } = useAuthStore()
  const { heroTheme, setHeroTheme } = useThemeStore()

  return (
    <AnimatePresence>
      {isAdmin && (
        <motion.div
          key="theme-switcher"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-1 p-1.5 rounded-full glass-strong"
          style={{ boxShadow: '0 0 30px rgba(6,182,212,0.15)' }}
        >
          {/* Admin badge */}
          <span className="text-[10px] font-mono text-cyan-500/60 px-2 tracking-widest hidden sm:block">
            THEME
          </span>

          {THEMES.map((t) => (
            <button
              key={t.id}
              id={`theme-btn-${t.id}`}
              onClick={() => setHeroTheme(t.id)}
              title={`Switch to ${t.label} theme`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                heroTheme === t.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
