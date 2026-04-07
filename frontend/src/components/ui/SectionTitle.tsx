import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface Props {
  eyebrow?: string
  title: string
  highlight?: string
  subtitle?: string
  align?: 'left' | 'center'
}

export default function SectionTitle({ eyebrow, title, highlight, subtitle, align = 'center' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const alignCls = align === 'center' ? 'items-center text-center' : 'items-start text-left'

  const rendered = highlight
    ? title.replace(highlight, `<span class="gradient-text">${highlight}</span>`)
    : title

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={`flex flex-col gap-3 ${alignCls}`}
    >
      {eyebrow && <span className="text-xs font-mono tracking-[0.25em] uppercase text-cyan-400/80">{eyebrow}</span>}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight" dangerouslySetInnerHTML={{ __html: rendered }} />
      {subtitle && <p className="text-slate-400 text-base sm:text-lg max-w-2xl mt-1">{subtitle}</p>}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{ originX: align === 'center' ? 0.5 : 0 }}
        className="h-px w-16 bg-gradient-to-r from-cyan-500 to-violet-500 mt-2"
      />
    </motion.div>
  )
}
