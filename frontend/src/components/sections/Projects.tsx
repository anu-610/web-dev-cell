import { useEffect, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { GitBranch, ExternalLink, Star } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import SectionTitle from '@/components/ui/SectionTitle'
import NeonButton from '@/components/ui/NeonButton'
import { apiFetch } from '@/lib/api'

export interface Project {
  id: string
  title: string
  description: string
  tags: string
  thumbnail_url?: string
  github_url?: string
  live_url?: string
  featured: boolean
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } }
const item: Variants = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' as const } } }

function Tag({ t }: { t: string }) {
  return (
    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-void-800/80 text-cyan-400/80 border border-cyan-500/10">{t}</span>
  )
}

function ProjectCard({ p }: { p: Project }) {
  const tagList = p.tags ? p.tags.split(',').map(t => t.trim()) : []

  return (
    <motion.div variants={item} className={p.featured ? 'sm:col-span-2 md:col-span-2' : ''}>
      <GlassCard glow={p.featured ? 'violet' : 'none'} className="flex flex-col h-full relative overflow-hidden">
        {p.featured && (
          <div className="absolute top-4 right-4 flex items-center gap-1 text-xs text-violet-400 font-mono z-20 bg-void-950/80 px-2 py-1 rounded backdrop-blur-sm">
            <Star size={12} fill="currentColor" /> Featured
          </div>
        )}
        <div className="w-full h-48 rounded-xl mb-5 bg-gradient-to-br from-void-800 to-void-700 flex items-center justify-center overflow-hidden shrink-0">
          {p.thumbnail_url ? (
            <img
              src={p.thumbnail_url}
              alt={p.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=No+Image' }}
            />
          ) : (
            <span className="text-4xl font-black text-white/10 font-mono select-none">{p.title.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1 flex flex-col">
          <h3 className="text-white font-bold text-xl mb-2 leading-snug">{p.title}</h3>
          <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-4">{p.description}</p>
          {tagList.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">{tagList.map(t => <Tag key={t} t={t} />)}</div>
          )}
          <div className="flex gap-3 mt-auto">
            {p.github_url && (
              <a href={p.github_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors">
                <GitBranch size={15} /> Source
              </a>
            )}
            {p.live_url && (
              <a href={p.live_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-emerald-400/80 hover:text-emerald-400 transition-colors">
                <ExternalLink size={15} /> Live
              </a>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

type Filter = 'all' | 'featured'

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    apiFetch<Project[]>('/projects')
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const displayed = filter === 'featured' ? projects.filter(p => p.featured) : projects

  return (
    <section id="projects" className="py-16 sm:py-20 md:py-28 section-pad relative bg-grid">
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          eyebrow="What We Build"
          title="Projects & Events"
          highlight="Projects"
          subtitle="From CTF platforms to portals — real software, built by real students."
        />

        {/* Filter tabs */}
        <div className="flex gap-2 mt-10 justify-center">
          {(['all', 'featured'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-all duration-200 ${
                filter === f ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-12 text-center text-slate-500 font-mono animate-pulse">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="mt-12 text-center text-slate-500 font-mono">No projects found.</div>
        ) : (
          <motion.div
            key={filter}
            variants={container} initial="hidden" animate="show"
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          >
            {displayed.map(p => <ProjectCard key={p.id} p={p} />)}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <a href="https://github.com/kamandprompt" target="_blank" rel="noopener noreferrer">
            <NeonButton variant="outline" size="lg"><GitBranch size={18} />View all on GitHub</NeonButton>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
