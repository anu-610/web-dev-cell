// Theme C: SVG animated circuit board
// Paths use pathLength="1" trick for device-independent dash animation

interface CircuitPath {
  d: string
  duration: number
  delay: number
  color?: string
}

// Circuit paths designed in a 100×56 viewBox
// Concentrated toward the right half so text is readable on the left
const PATHS: CircuitPath[] = [
  { d: 'M 38 4 H 92 V 14',                          duration: 5,   delay: 0    },
  { d: 'M 55 4 V 24 H 42 V 38 H 88 V 48 H 96',      duration: 7,   delay: 1.2  },
  { d: 'M 70 14 V 28 H 80 V 42 H 96',               duration: 4.5, delay: 0.6  },
  { d: 'M 92 14 H 78 V 28 H 96',                    duration: 3.5, delay: 2    },
  { d: 'M 65 38 V 52 H 85',                          duration: 4,   delay: 1.8  },
  { d: 'M 42 24 H 58 V 38',                          duration: 3,   delay: 0.4  },
  { d: 'M 48 4 V 14 H 60 V 24',                     duration: 5.5, delay: 3    },
  { d: 'M 80 28 H 96 V 42 H 88',                    duration: 4.2, delay: 2.5  },
  { d: 'M 35 14 H 48 V 28 H 36 V 44',               duration: 6,   delay: 1.5, color: '#a78bfa' },
  { d: 'M 72 52 H 96',                               duration: 3,   delay: 3.5  },
]

// Nodes (glow dots) at circuit intersections
const NODES: { cx: number; cy: number; delay: number }[] = [
  { cx: 92, cy: 4,  delay: 0   }, { cx: 92, cy: 14, delay: 0.5 },
  { cx: 55, cy: 4,  delay: 1   }, { cx: 55, cy: 24, delay: 1.2 },
  { cx: 42, cy: 24, delay: 0.8 }, { cx: 42, cy: 38, delay: 1.5 },
  { cx: 88, cy: 38, delay: 2   }, { cx: 88, cy: 48, delay: 2.2 },
  { cx: 70, cy: 14, delay: 0.6 }, { cx: 70, cy: 28, delay: 1.1 },
  { cx: 80, cy: 28, delay: 1.8 }, { cx: 80, cy: 42, delay: 2.1 },
  { cx: 65, cy: 38, delay: 1.9 }, { cx: 65, cy: 52, delay: 2.4 },
  { cx: 58, cy: 24, delay: 0.9 }, { cx: 48, cy: 14, delay: 3.1 },
  { cx: 48, cy: 28, delay: 1.6 }, { cx: 36, cy: 44, delay: 2.7 },
]

export default function HeroCircuit() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Subtle deep cyan glow on the right */}
      <div className="absolute right-0 top-0 w-2/3 h-full opacity-10"
        style={{ background: 'radial-gradient(ellipse 60% 80% at 100% 50%, #06b6d4, transparent)' }} />

      <svg
        viewBox="0 0 100 56"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        aria-hidden
      >
        <defs>
          <filter id="circuit-glow">
            <feGaussianBlur stdDeviation="0.4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Circuit paths */}
        {PATHS.map((p, i) => (
          <path
            key={i}
            d={p.d}
            fill="none"
            stroke={p.color ?? '#22d3ee'}
            strokeWidth="0.35"
            pathLength={1}
            strokeDasharray="1"
            strokeLinecap="round"
            filter="url(#circuit-glow)"
            style={{
              strokeDashoffset: 1,
              opacity: 0.55,
              animation: `circuit-flow ${p.duration}s linear ${p.delay}s infinite`,
            }}
          />
        ))}

        {/* Glow nodes */}
        {NODES.map((n, i) => (
          <circle
            key={i}
            cx={n.cx}
            cy={n.cy}
            r="0.9"
            fill="#22d3ee"
            filter="url(#circuit-glow)"
            style={{
              animation: `node-pulse 2.5s ease-in-out ${n.delay}s infinite`,
              transformOrigin: `${n.cx}px ${n.cy}px`,
            }}
          />
        ))}
      </svg>
    </div>
  )
}
