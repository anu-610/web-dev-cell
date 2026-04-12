import { motion } from 'framer-motion'
import { ChevronDown, ArrowRight, Globe } from 'lucide-react'
import NeonButton from '@/components/ui/NeonButton'
import HeroAurora from '@/components/hero/HeroAurora'
import HeroMesh, { useTypewriter } from '@/components/hero/HeroMesh'
import HeroCircuit from '@/components/hero/HeroCircuit'
import MacTerminal from '@/components/hero/MacTerminal'
import { useThemeStore } from '@/stores/themeStore'

const STATS = [
  { value: '20+', label: 'Projects Shipped' },
  { value: '30+', label: 'Active Members' },
  { value: '3+',  label: 'Years Running' },
  { value: '∞',   label: 'Coffee Consumed' },
]

const MESH_WORDS = [
  'Building the internet,',
  'One commit at a time.',
  'Full-Stack Engineers.',
  'Open Source & Proud.',
]

// Tagline for Mesh theme uses typewriter in headline
function MeshTagline() {
  const typed = useTypewriter(MESH_WORDS, 70, 35, 2000)
  return (
    <span className="text-cyan-400 font-mono">
      {typed}
      <span className="animate-pulse">|</span>
    </span>
  )
}

export default function Hero() {
  const { heroTheme } = useThemeStore()
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section
      id="hero"
      className="relative w-full min-h-screen overflow-hidden flex items-center"
      style={{ background: '#020817' }}
    >
      {/* ── Background Theme ── */}
      {heroTheme === 'aurora'  && <HeroAurora />}
      {heroTheme === 'mesh'    && <HeroMesh />}
      {heroTheme === 'circuit' && <HeroCircuit />}

      {/* ── Vignette ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(2,8,23,0.6) 100%)' }} />

      {/* ── Main layout: text left | terminal right ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 md:px-16 flex flex-col md:flex-row items-center gap-10 md:gap-6 py-24 md:py-0 min-h-screen">

        {/* ── LEFT: Content ── */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 md:max-w-[55%]">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mb-5"
          >
            <span className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full text-xs font-mono text-cyan-400 tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              KamandPrompt · IIT Mandi
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.92] tracking-tight mb-5"
          >
            Web{' '}
            <span className="gradient-text">Dev</span>
            <br />Cell
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="text-slate-400 text-base sm:text-lg md:text-xl max-w-xl mb-8 leading-relaxed"
          >
            {heroTheme === 'mesh' ? (
              <MeshTagline />
            ) : (
              <>
                Building the internet, one commit at a time.
                <br />
                <span className="text-slate-500 text-sm sm:text-base font-mono">
                  Full-stack · 3D · Open Source
                </span>
              </>
            )}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 w-full sm:w-auto mb-12"
          >
            <NeonButton size="md" className="w-full sm:w-auto" onClick={() => go('projects')}>
              <Globe size={16} /> Explore Projects
            </NeonButton>
            <NeonButton size="md" variant="outline" className="w-full sm:w-auto" onClick={() => go('team')}>
              Meet the Team <ArrowRight size={16} />
            </NeonButton>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5"
          >
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + i * 0.1 }}
                className="text-center md:text-left"
              >
                <div className="text-2xl sm:text-3xl font-black gradient-text">{s.value}</div>
                <div className="text-[10px] sm:text-xs text-slate-500 tracking-wider uppercase mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT: macOS Terminal (desktop only) ── */}
        <div className="hidden md:flex flex-1 items-center justify-end md:max-w-[46%]">
          <MacTerminal />
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}
        onClick={() => go('projects')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-cyan-400/50 hover:text-cyan-400 transition-colors"
        aria-label="Scroll down"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}>
          <ChevronDown size={26} />
        </motion.div>
      </motion.button>
    </section>
  )
}
