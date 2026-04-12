import { motion } from 'framer-motion'
import { type ReactNode, type ButtonHTMLAttributes, useRef, useState } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'solid' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  color?: 'cyan' | 'violet'
}

export default function NeonButton({ children, variant = 'solid', size = 'md', color = 'cyan', className = '', ...props }: Props) {
  const sz = { sm: 'text-xs px-4 py-2', md: 'text-sm px-6 py-3', lg: 'text-base px-8 py-4' }[size]
  const ref = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current || props.disabled) return
    const { clientX, clientY } = e
    const { height, width, left, top } = ref.current.getBoundingClientRect()
    const middleX = clientX - (left + width / 2)
    const middleY = clientY - (top + height / 2)
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 })
  }

  const reset = () => setPosition({ x: 0, y: 0 })

  const v =
    variant === 'solid'
      ? color === 'cyan'
          ? 'bg-cyan-500 text-void-950 font-semibold hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.7)]'
          : 'bg-violet-500 text-white font-semibold hover:bg-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_35px_rgba(139,92,246,0.7)]'
      : variant === 'outline'
      ? color === 'cyan'
          ? 'border border-cyan-500/50 text-cyan-400 hover:border-cyan-400 hover:bg-cyan-500/10'
          : 'border border-violet-500/50 text-violet-400 hover:border-violet-400 hover:bg-violet-500/10'
      : color === 'cyan'
          ? 'text-cyan-400 hover:bg-cyan-500/10'
          : 'text-violet-400 hover:bg-violet-500/10'

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-wide transition-colors disabled:opacity-40 ${sz} ${v} ${className}`}
      {...(props as object)}
    >
      {children}
    </motion.button>
  )
}

