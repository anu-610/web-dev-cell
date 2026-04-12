import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, GitFork, Activity, Clock } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import SectionTitle from '@/components/ui/SectionTitle'
import { useThemeStore } from '@/stores/themeStore'
import { apiFetch } from '@/lib/api'

interface RepoStats {
  name: string
  stars: number
  forks: number
  openIssues: number
  lastUpdated: string
  description: string
}

export default function GitHubStats() {
  const [stats, setStats] = useState<RepoStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showStats, setShowStats] = useState(false)
  const [repoName, setRepoName] = useState('')

  useEffect(() => {
    // Check if the setting is enabled globally
    apiFetch<any>('/settings/site')
      .then(res => {
        if (res.show_github_stats && res.github_repo) {
          setShowStats(true)
          setRepoName(res.github_repo)
          fetchRepoData(res.github_repo)
        } else {
          setLoading(false)
        }
      })
      .catch(err => {
        console.error('Failed to load site settings', err)
        setLoading(false)
      })
  }, [])

  const fetchRepoData = async (repo: string) => {
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}`)
      if (!res.ok) throw new Error('Failed to fetch from GitHub')
      const data = await res.json()

      setStats({
        name: data.full_name,
        stars: data.stargazers_count,
        forks: data.forks_count,
        openIssues: data.open_issues_count,
        lastUpdated: new Date(data.pushed_at || data.updated_at).toLocaleString('en-US', {
          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        }),
        description: data.description || 'No description available.',
      })
    } catch (err) {
      console.error('GitHub API error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!showStats || loading) return null

  return (
    <section className="py-16 section-pad relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <GlassCard className="p-8 md:p-12 border-cyan-500/20 bg-gradient-to-br from-void-900 to-void-950">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">

            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold uppercase tracking-widest mb-4">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                Open Source
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Powered by Open Source
              </h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                We believe in building transparently. Explore our primary repository, contribute to our codebase, and see our live activity on GitHub.
              </p>

              <a
                href={`https://github.com/${repoName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
              >
                View {repoName} on GitHub <span className="font-mono text-xl">→</span>
              </a>
            </div>

            {stats && (
              <div className="w-full md:w-auto shrink-0 flex flex-col gap-4">
                <div className="glass px-6 py-4 rounded-xl flex items-center justify-between gap-8 min-w-[240px]">
                  <div className="flex items-center gap-3 text-slate-300 font-medium">
                    <Star className="text-yellow-400" size={20} fill="currentColor" /> Stars
                  </div>
                  <span className="text-2xl font-black text-white font-mono">{stats.stars}</span>
                </div>

                <div className="glass px-6 py-4 rounded-xl flex items-center justify-between gap-8 min-w-[240px]">
                  <div className="flex items-center gap-3 text-slate-300 font-medium">
                    <GitFork className="text-slate-400" size={20} /> Forks
                  </div>
                  <span className="text-2xl font-black text-white font-mono">{stats.forks}</span>
                </div>

                <div className="glass px-6 py-4 rounded-xl flex items-center justify-between gap-8 min-w-[240px]">
                  <div className="flex items-center gap-3 text-slate-300 font-medium">
                    <Activity className="text-emerald-400" size={20} /> Open Issues
                  </div>
                  <span className="text-2xl font-black text-white font-mono">{stats.openIssues}</span>
                </div>

                <div className="text-xs text-slate-500 text-center font-mono mt-2 flex items-center justify-center gap-1.5">
                  <Clock size={12} /> Last push: {stats.lastUpdated}
                </div>
              </div>
            )}

          </div>
        </GlassCard>
      </div>
    </section>
  )
}
