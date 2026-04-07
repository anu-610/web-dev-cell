import { motion } from 'framer-motion'
import { type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  glow?: 'cyan' | 'violet' | 'none'
  onClick?: () => void
}

export default function GlassCard({ children, className = '', glow = 'none', onClick }: Props) {
  const glowCls =
    glow === 'cyan'   ? 'hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:border-cyan-500/30' :
    glow === 'violet' ? 'hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:border-violet-500/30' : ''

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`glass rounded-2xl p-6 border border-white/5 transition-all duration-300 ${glowCls} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}
