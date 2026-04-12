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
      className="hidden md:flex flex-shrink-0 items-center justify-center"
      style={{ width: '100%', maxWidth: '580px' }}
    >
      {/* 3D tilt wrapper — separate from motion so transform isn't cancelled by filter */}
      <div
        className="w-full pointer-events-none select-none"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'perspective(800px) rotateY(-20deg) rotateX(-4deg)',
          // rotateY NEGATIVE = right edge projects TOWARD viewer (correct)
          // Box shadows simulate depth: right/bottom edges cast darkness outward
          boxShadow: `
            20px 20px 60px rgba(0,0,0,0.7),
            40px 40px 100px rgba(0,0,0,0.5),
            -4px -4px 30px rgba(6,182,212,0.06),
            0 0 80px rgba(6,182,212,0.04)
          `,
          borderRadius: '12px',
        }}
      >

      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: '#1a1b26',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 0 80px rgba(6,182,212,0.07), inset 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        {/* ── Title bar ── */}
        <div
          className="flex items-center gap-2 px-4 py-3 border-b border-white/5"
          style={{ background: '#24283b' }}
        >
          <span className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
          <span className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
          <span className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
          <div className="flex-1 text-center">
            <span className="text-xs text-slate-500 font-mono">dev-cell — bash — 80×24</span>
          </div>
        </div>

        {/* ── Terminal body ── */}
        <div
          ref={bodyRef}
          className="p-4 font-mono text-xs sm:text-[13px] leading-relaxed"
          style={{ minHeight: '300px', maxHeight: '360px', overflowY: 'hidden', background: '#1a1b26' }}
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
          {/* Blinking cursor */}
          <span className="inline-block w-[7px] h-[14px] bg-cyan-400/80 terminal-cursor align-middle mt-0.5" />
        </div>
      </div>
      </div>
    </motion.div>
  )
}
