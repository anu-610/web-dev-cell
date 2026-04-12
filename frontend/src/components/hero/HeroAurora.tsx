import { useEffect, useRef } from 'react'

const COLORS = ['#22d3ee', '#a78bfa', '#818cf8', '#34d399', '#06b6d4']

interface Particle {
  x: number; y: number
  vx: number; vy: number
  size: number; opacity: number
  color: string
}

export default function HeroAurora() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const isMobile = window.innerWidth < 768
    const count = isMobile ? 28 : 85

    let W = (canvas.width = window.innerWidth)
    let H = (canvas.height = window.innerHeight)

    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      size: Math.random() * 2.2 + 0.5,
      opacity: Math.random() * 0.55 + 0.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))

    const CONNECT = isMobile ? 90 : 130
    let raf: number

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      for (const p of particles) {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > W) p.vx *= -1
        if (p.y < 0 || p.y > H) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.fill()
      }

      if (!isMobile) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x
            const dy = particles[i].y - particles[j].y
            const d = Math.sqrt(dx * dx + dy * dy)
            if (d < CONNECT) {
              ctx.beginPath()
              ctx.moveTo(particles[i].x, particles[i].y)
              ctx.lineTo(particles[j].x, particles[j].y)
              ctx.strokeStyle = '#22d3ee'
              ctx.globalAlpha = (1 - d / CONNECT) * 0.12
              ctx.lineWidth = 0.7
              ctx.stroke()
            }
          }
        }
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }

    draw()
    const onResize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      {/* Aurora blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="aurora-blob-1 absolute rounded-full opacity-20"
          style={{ width: 700, height: 700, top: '-15%', left: '-10%',
            background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
            filter: 'blur(100px)' }} />
        <div className="aurora-blob-2 absolute rounded-full opacity-15"
          style={{ width: 600, height: 600, bottom: '-20%', right: '-5%',
            background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
            filter: 'blur(90px)' }} />
        <div className="aurora-blob-3 absolute rounded-full opacity-10"
          style={{ width: 450, height: 450, top: '30%', right: '20%',
            background: 'radial-gradient(circle, #059669 0%, transparent 70%)',
            filter: 'blur(80px)' }} />
      </div>
    </>
  )
}
