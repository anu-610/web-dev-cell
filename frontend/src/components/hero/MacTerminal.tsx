import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

type LineType = 'cmd' | 'output' | 'success' | 'info' | 'blank' | 'progress'

interface ScriptLine {
  type: LineType
  text: string
  preDelay: number
}

const SCRIPT: ScriptLine[] = [
  { type: 'cmd',      text: '$ npm run dev',                                   preDelay: 400  },
  { type: 'blank',    text: '',                                                 preDelay: 900  },
  { type: 'output',   text: '  VITE v8.0.7  ready in 312ms',                   preDelay: 100  },
  { type: 'info',     text: '  ➜  Local:   http://localhost:5173/',             preDelay: 100  },
  { type: 'info',     text: '  ➜  Network: http://172.19.0.1:5173/',           preDelay: 80   },
  { type: 'blank',    text: '',                                                 preDelay: 900  },
  { type: 'cmd',      text: '$ git commit -m "feat: epic redesign 🚀"',         preDelay: 200  },
  { type: 'output',   text: '[main a1b2c3d] feat: epic redesign 🚀',            preDelay: 600  },
  { type: 'output',   text: ' 7 files changed, 412 insertions(+)',              preDelay: 100  },
  { type: 'blank',    text: '',                                                 preDelay: 500  },
  { type: 'cmd',      text: '$ git push origin main',                           preDelay: 300  },
  { type: 'progress', text: 'Writing objects: 100% ████████████ 15/15',         preDelay: 800  },
  { type: 'success',  text: '✓ → kamandprompt/dev-cell [main]',                preDelay: 300  },
  { type: 'blank',    text: '',                                                 preDelay: 700  },
  { type: 'cmd',      text: '$ docker compose up --build',                      preDelay: 300  },
  { type: 'progress', text: '[+] Building dev-cell-api  ████████░░  80%',       preDelay: 1000 },
  { type: 'success',  text: ' ✔ Container dev-cell-db-1   Healthy',            preDelay: 500  },
  { type: 'success',  text: ' ✔ Container dev-cell-api-1  Started',            preDelay: 300  },
  { type: 'blank',    text: '',                                                 preDelay: 200  },
  { type: 'info',     text: 'INFO:  Uvicorn running on 0.0.0.0:8000',          preDelay: 150  },
  { type: 'success',  text: 'INFO:  Application startup complete. 🚀',          preDelay: 150  },
]

const LINE_COLORS: Record<LineType, string> = {
  cmd:      'text-violet-300',
  output:   'text-slate-400',
  success:  'text-emerald-400',
  info:     'text-cyan-400',
  blank:    'text-transparent',
  progress: 'text-amber-400',
}

interface VisibleLine extends ScriptLine {
  id: number
  charCount: number
}

export default function MacTerminal() {
  const [lines, setLines] = useState<VisibleLine[]>([])
  const [fading, setFading] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(0)

  useEffect(() => {
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []

    const run = () => {
      setLines([])
      setFading(false)
      let totalDelay = 500

      SCRIPT.forEach((line) => {
        totalDelay += line.preDelay
        const delay = totalDelay
        const id = ++idRef.current
        // cmd lines get extra time for the CSS typing animation to play
        if (line.type === 'cmd') totalDelay += line.text.length * 75

        const t = setTimeout(() => {
          if (cancelled) return
          setLines(prev => [...prev, { ...line, id, charCount: line.text.length }])
        }, delay)
        timers.push(t)
      })

      const fadeT = setTimeout(() => { if (!cancelled) setFading(true) }, totalDelay + 2500)
      const restartT = setTimeout(() => { if (!cancelled) run() }, totalDelay + 3800)
      timers.push(fadeT, restartT)
    }

    run()
    return () => { cancelled = true; timers.forEach(clearTimeout) }
  }, [])

  // Auto-scroll
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [lines])

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, y: 20 }}
      animate={{ opacity: fading ? 0 : 1, x: 0, y: 0 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
      className="hidden md:flex flex-shrink-0 items-center justify-end relative w-full"
      style={{ maxWidth: '880px' }}
    >
      {/* 3D tilt wrapper */}
      <div
        className="w-full pointer-events-none select-none"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'perspective(1200px) rotateY(-16deg) rotateX(-2deg)',
          boxShadow: `
            28px 28px 80px rgba(0,0,0,0.8),
            56px 56px 140px rgba(0,0,0,0.55),
            0 0 120px rgba(6,182,212,0.06)
          `,
          borderRadius: '16px',
        }}
      >
        {/*
          Real Glass Border Shell:
          Thicker frosted white border to make the glass effect pop.
        */}
        <div
          style={{
            borderRadius: '16px',
            padding: '4px', /* Thicker glass border */
            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.3) 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.5)', /* Solid white outer line */
            boxShadow: `
              inset 0 2px 4px rgba(255,255,255,0.4),
              0 0 50px rgba(255,255,255,0.1)
            `,
          }}
        >
          {/* Inner card */}
          <div className="rounded-[14px] overflow-hidden" style={{ background: '#1a1b26' }}>

            {/* ── Title bar ── */}
            <div
              className="flex items-center gap-2 px-4 py-3 border-b"
              style={{
                background: 'linear-gradient(180deg, #2a2d3e 0%, #24283b 100%)',
                borderColor: 'rgba(255,255,255,0.06)',
              }}
            >
              <span className="w-3 h-3 rounded-full" style={{ background: '#ff5f57', boxShadow: '0 0 6px rgba(255,95,87,0.7)' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#febc2e', boxShadow: '0 0 6px rgba(254,188,46,0.6)' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#28c840', boxShadow: '0 0 6px rgba(40,200,64,0.6)' }} />
              <div className="flex-1 text-center">
                <span className="text-xs text-slate-400 font-mono tracking-wide">~/dev-cell</span>
              </div>
            </div>

            {/* ── Terminal body ── */}
            <div className="relative" style={{ background: '#1a1b26' }}>
              <div
                ref={bodyRef}
                className="px-6 py-5 font-mono text-[13px] sm:text-sm leading-relaxed"
                style={{ minHeight: '400px', maxHeight: '480px', overflowY: 'hidden' }}
              >
                {lines.map((line) =>
                  line.type === 'blank' ? (
                    <div key={line.id} className="h-3" />
                  ) : (
                    <div key={line.id} className="mb-0.5">
                      <span
                        className={`${LINE_COLORS[line.type]} block overflow-hidden whitespace-nowrap`}
                        style={
                          line.type === 'cmd'
                            ? {
                                width: '0',
                                animation: `terminal-typing ${line.charCount * 75}ms steps(${line.charCount}, end) forwards`,
                              }
                            : undefined
                        }
                      >
                        {line.text}
                      </span>
                    </div>
                  )
                )}
                <span className="inline-block w-[7px] h-[15px] bg-cyan-400/80 terminal-cursor align-middle mt-0.5" />
              </div>

              {/* Edge fades — dissolve content into background at all four sides */}
              <div className="absolute top-0 left-0 right-0 pointer-events-none"
                style={{ height: '48px', background: 'linear-gradient(to bottom, #1a1b26, transparent)' }} />
              <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
                style={{ height: '80px', background: 'linear-gradient(to top, rgba(26,27,38,0.98), transparent)' }} />
              <div className="absolute top-0 bottom-0 left-0 pointer-events-none"
                style={{ width: '32px', background: 'linear-gradient(to right, rgba(26,27,38,0.7), transparent)' }} />
              <div className="absolute top-0 bottom-0 right-0 pointer-events-none"
                style={{ width: '56px', background: 'linear-gradient(to left, rgba(26,27,38,0.9), transparent)' }} />
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  )
}
