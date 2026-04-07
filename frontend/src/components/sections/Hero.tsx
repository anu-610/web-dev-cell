import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ArrowRight, Globe } from 'lucide-react'
import NeonButton from '@/components/ui/NeonButton'

const HeroScene = lazy(() => import('@/components/three/HeroScene'))

const STATS = [
  { value: '20+', label: 'Projects Shipped' },
  { value: '30+', label: 'Active Members' },
  { value: '3+', label: 'Years Running' },
  { value: '∞', label: 'Coffee Consumed' },
]

export default function Hero() {
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section id="hero" className="relative h-screen overflow-hidden flex items-center justify-center">
      {/* Three.js canvas */}
      <Suspense fallback={null}>
        <HeroScene />
      </Suspense>

      {/* Vignette gradient so text stays readable */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-void-950/30 to-void-950/80 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs font-mono text-cyan-400 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            KamandPrompt · IIT Mandi
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="text-6xl sm:text-7xl md:text-8xl font-black text-white leading-[0.95] tracking-tight mb-6"
        >
          Web{' '}
          <span className="gradient-text">Dev</span>
          <br />
          Cell
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75 }}
          className="text-slate-400 text-lg md:text-xl max-w-xl mb-10 leading-relaxed"
        >
          Building the internet, one commit at a time.
          <br />
          <span className="text-slate-500 text-base font-mono">Full-stack · 3D · Open Source</span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.0 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <NeonButton size="lg" onClick={() => go('projects')}>
            <Globe size={18} /> Explore Projects
          </NeonButton>
          <NeonButton size="lg" variant="outline" onClick={() => go('team')}>
            Meet the Team <ArrowRight size={18} />
          </NeonButton>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="flex flex-wrap justify-center gap-8 mt-16"
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-black gradient-text">{s.value}</div>
              <div className="text-xs text-slate-500 tracking-wider uppercase mt-1">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
        onClick={() => go('projects')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-cyan-400/60 hover:text-cyan-400 transition-colors"
        aria-label="Scroll down"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}>
          <ChevronDown size={28} />
        </motion.div>
      </motion.button>
    </section>
  )
}
