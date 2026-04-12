import { useEffect, useState } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)

  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 }
  const x = useSpring(cursorX, springConfig)
  const y = useSpring(cursorY, springConfig)

  useEffect(() => {
    // Only show on desktop (fine pointers)
    if (window.matchMedia('(pointer: coarse)').matches) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true)
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)

      // Check if hovering over clickable elements
      const target = e.target as HTMLElement
      const isClickable = target.closest('button, a, input, select, textarea, [role="button"]')
      setIsHovering(!!isClickable)
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)
    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [cursorX, cursorY, isVisible])

  if (!isVisible) return null

  return (
    <>
      {/* Inner Solid Dot */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-cyan-400 rounded-full pointer-events-none z-[9999] mix-blend-screen"
        style={{ x: cursorX, y: cursorY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          scale: isClicking ? 0.5 : isHovering ? 0 : 1,
          opacity: isHovering ? 0 : 1
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      />

      {/* Outer Glow Ring */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-cyan-400/50 rounded-full pointer-events-none z-[9998] flex items-center justify-center backdrop-invert-[0.1]"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
        animate={{
          scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
          backgroundColor: isHovering ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
          borderColor: isHovering ? 'rgba(6, 182, 212, 0.8)' : 'rgba(6, 182, 212, 0.5)',
        }}
      />
    </>
  )
}
