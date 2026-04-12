import { useEffect, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { GitBranch, Link2, GraduationCap } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import SectionTitle from '@/components/ui/SectionTitle'
import { apiFetch } from '@/lib/api'

export interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
  year: number
  github_url?: string
  linkedin_url?: string
  instagram_url?: string
  avatar_url?: string
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }
const item: Variants = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } } }

function Avatar({ name, url }: { name: string, url?: string }) {
  if (url) {
    return <img src={url} alt={name} className="w-full h-full object-cover" />
  }
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const hue = (name.charCodeAt(0) * 7) % 360
  return (
    <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white" style={{ background: `hsl(${hue},65%,30%)` }}>
      {initials}
    </div>
  )
}

function MemberCard({ m }: { m: TeamMember }) {
  return (
    <motion.div variants={item} className="h-full">
      <GlassCard glow="cyan" className="flex flex-col h-full">
        <div className="w-20 h-20 rounded-2xl overflow-hidden mb-4 ring-2 ring-cyan-500/20 flex-shrink-0">
          <Avatar name={m.name} url={m.avatar_url} />
        </div>
        <div className="flex-1 flex flex-col">
          <h3 className="text-white font-bold text-lg leading-tight">{m.name}</h3>
          <p className="text-cyan-400 text-sm font-mono mt-0.5 mb-2">{m.role}</p>
          <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 flex-1">{m.bio}</p>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500">
            <GraduationCap size={13} /> Year {m.year || 'N/A'}
          </div>
        </div>
        <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
          {m.github_url && (
            <a href={m.github_url} target="_blank" rel="noopener noreferrer"
              className="text-slate-500 hover:text-cyan-400 transition-colors" aria-label="GitHub">
              <GitBranch size={17} />
            </a>
          )}
          {m.linkedin_url && (
            <a href={m.linkedin_url} target="_blank" rel="noopener noreferrer"
              className="text-slate-500 hover:text-blue-400 transition-colors" aria-label="LinkedIn">
              <Link2 size={17} />
            </a>
          )}
          {m.instagram_url && (
            <a href={m.instagram_url} target="_blank" rel="noopener noreferrer"
              className="text-slate-500 hover:text-pink-400 transition-colors" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
          )}
        </div>
      </GlassCard>
    </motion.div>
  )
}

export default function Team() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<TeamMember[]>('/members')
      .then(setTeam)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="team" className="py-16 sm:py-20 md:py-28 section-pad relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          eyebrow="The People"
          title="Meet the Team"
          highlight="Team"
          subtitle="The humans behind the code — designers, engineers, and hackers building the future of the web at IIT Mandi."
        />

        {loading ? (
          <div className="mt-16 text-center text-slate-500 font-mono animate-pulse">Loading members...</div>
        ) : team.length === 0 ? (
          <div className="mt-16 text-center text-slate-500 font-mono">No team members found.</div>
        ) : (
          <motion.div
            variants={container} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {team.map(m => <MemberCard key={m.id} m={m} />)}
          </motion.div>
        )}
      </div>
    </section>
  )
}
