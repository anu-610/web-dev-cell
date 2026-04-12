import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Terminal, LogOut } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

const SCROLL_NAV = [
  { label: 'Projects', id: 'projects' },
  { label: 'Team', id: 'team' },
  { label: 'Contact', id: 'contact' },
]

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'
  const { token, logout } = useAuthStore()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const go = (id: string) => {
    setOpen(false)
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.location.href = `/#${id}`
    }
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'glass-strong shadow-lg shadow-black/40' : 'bg-transparent'}`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
              <Terminal size={16} className="text-white" />
            </div>
            <span className="font-bold text-white">Web<span className="neon-cyan">Dev</span>Cell</span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8">
            {SCROLL_NAV.map(l => (
              <li key={l.id}>
                <button
                  onClick={() => go(l.id)}
                  className="text-slate-400 hover:text-cyan-400 text-sm font-medium tracking-wide transition-colors duration-200"
                >
                  {l.label}
                </button>
              </li>
            ))}
            <li>
              <Link
                to="/posts"
                className="text-slate-400 hover:text-cyan-400 text-sm font-medium tracking-wide transition-colors duration-200"
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                to="/announcements"
                className="text-slate-400 hover:text-cyan-400 text-sm font-medium tracking-wide transition-colors duration-200"
              >
                Alerts
              </Link>
            </li>
            {token && (
              <li>
                <button
                  onClick={async () => {
                    await logout()
                    window.location.reload() // Force reload to clear all states cleanly
                  }}
                  className="flex items-center gap-1.5 text-red-400/80 hover:text-red-400 text-sm font-medium tracking-wide transition-colors duration-200 ml-4"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </li>
            )}
          </ul>

          {/* Mobile toggle */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setOpen(v => !v)}
            className="md:hidden flex flex-col gap-1.5 p-1"
            aria-label="Menu"
          >
            <span className={`block w-5 h-0.5 bg-cyan-400 transition-transform duration-300 ${open ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block w-5 h-0.5 bg-cyan-400 transition-opacity duration-300 ${open ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-cyan-400 transition-transform duration-300 ${open ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-40 glass-strong flex flex-col items-center justify-center gap-8"
        >
          {SCROLL_NAV.map((l, i) => (
            <motion.button
              key={l.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => go(l.id)}
              className="text-2xl font-bold text-white hover:neon-cyan transition-all"
            >
              {l.label}
            </motion.button>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: SCROLL_NAV.length * 0.07 }}
          >
            <Link
              to="/posts"
              onClick={() => setOpen(false)}
              className="text-2xl font-bold text-white hover:neon-cyan transition-all"
            >
              Blog
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (SCROLL_NAV.length + 1) * 0.07 }}
          >
            <Link
              to="/announcements"
              onClick={() => setOpen(false)}
              className="text-2xl font-bold text-white hover:neon-cyan transition-all"
            >
              Alerts
            </Link>
          </motion.div>
          {token && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (SCROLL_NAV.length + 2) * 0.07 }}
            >
              <button
                onClick={async () => {
                  setOpen(false)
                  await logout()
                  window.location.reload()
                }}
                className="flex items-center gap-2 text-2xl font-bold text-red-400 hover:text-red-300 transition-all mt-4"
              >
                <LogOut size={24} />
                Sign Out
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </>
  )
}
