import { useEffect, useState } from 'react'

const WORDS = [
  'Building the internet,',
  'One commit at a time.',
  'Full-Stack Engineers.',
  'Open Source & Proud.',
  'IIT Mandi\'s finest.',
]

function useTypewriter(words: string[], typeSpeed = 75, deleteSpeed = 38, pause = 2000) {
  const [text, setText] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [phase, setPhase] = useState<'typing' | 'waiting' | 'deleting'>('typing')

  useEffect(() => {
    const word = words[wordIdx % words.length]
    if (phase === 'typing') {
      if (text.length < word.length) {
        const t = setTimeout(() => setText(word.slice(0, text.length + 1)), typeSpeed)
        return () => clearTimeout(t)
      } else {
        const t = setTimeout(() => setPhase('deleting'), pause)
        return () => clearTimeout(t)
      }
    }
    if (phase === 'deleting') {
      if (text.length > 0) {
        const t = setTimeout(() => setText(text.slice(0, -1)), deleteSpeed)
        return () => clearTimeout(t)
      } else {
        setWordIdx(i => i + 1)
        setPhase('typing')
      }
    }
  }, [text, phase, wordIdx, words, typeSpeed, deleteSpeed, pause])

  return text
}

export default function HeroMesh() {
  const typed = useTypewriter(WORDS)

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient mesh blobs */}
      <div className="mesh-blob-1 absolute rounded-full"
        style={{ width: 800, height: 800, top: '-30%', right: '-15%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.35) 0%, rgba(124,58,237,0.2) 50%, transparent 70%)',
          filter: 'blur(80px)' }} />
      <div className="mesh-blob-2 absolute rounded-full"
        style={{ width: 600, height: 600, bottom: '-25%', left: '-10%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, rgba(6,182,212,0.15) 60%, transparent 80%)',
          filter: 'blur(70px)' }} />
      <div className="mesh-blob-3 absolute rounded-full"
        style={{ width: 500, height: 500, top: '20%', left: '20%',
          background: 'radial-gradient(circle, rgba(5,150,105,0.2) 0%, transparent 70%)',
          filter: 'blur(60px)' }} />
      {/* Mesh grid overlay */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(6,182,212,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.6) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
      {/* Typewriter text — sits BELOW the hero content, blended in background as decorative */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center pointer-events-none hidden md:block">
        <span className="text-slate-600/30 font-mono text-sm tracking-widest select-none">
          {typed}<span className="animate-pulse">_</span>
        </span>
      </div>
    </div>
  )
}

// Export the typewriter hook so Hero.tsx can use it in the headline
export { useTypewriter }
