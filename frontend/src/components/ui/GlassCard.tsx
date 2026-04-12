import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import { type ReactNode, type MouseEvent } from 'react'

interface Props {
  children: ReactNode
  className?: string
  glow?: 'cyan' | 'violet' | 'none'
  onClick?: () => void
}

export default function GlassCard({ children, className = '', glow = 'none', onClick }: Props) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  const glowCls =
    glow === 'cyan'   ? 'hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] border-cyan-500/30' :
    glow === 'violet' ? 'hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] border-violet-500/30' : ''

  const glowColor =
    glow === 'cyan' ? 'rgba(6, 182, 212, 0.15)' :
    glow === 'violet' ? 'rgba(139, 92, 246, 0.15)' :
    'rgba(255, 255, 255, 0.05)'

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`group relative glass rounded-2xl p-6 transition-all duration-300 overflow-hidden ${glowCls} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              ${glowColor},
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative z-10 h-full w-full">{children}</div>
    </motion.div>
  )
}
