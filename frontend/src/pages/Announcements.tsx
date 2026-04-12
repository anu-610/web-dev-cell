import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, AlertCircle, ExternalLink, Calendar } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import SectionTitle from '@/components/ui/SectionTitle'
import GlassCard from '@/components/ui/GlassCard'

interface Announcement {
  id: string
  title: string
  message: string
  link_url: string | null
  end_date: string
  is_active: boolean
  created_at: string
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<Announcement[]>('/announcements')
      setAnnouncements(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }

  const isActuallyActive = (a: Announcement) => {
    return a.is_active && new Date(a.end_date).getTime() >= Date.now()
  }

  return (
    <div className="min-h-screen bg-void-950 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12">
          <SectionTitle title="Notifications" subtitle="All community announcements, events, and alerts" />
        </div>

        {error ? (
          <div className="p-6 border border-red-500/20 bg-red-500/10 rounded-xl flex items-center gap-3 text-red-400">
            <AlertCircle />
            <span>{error}</span>
          </div>
        ) : loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20 glass-strong rounded-2xl border border-white/5">
            <Bell className="mx-auto text-slate-500 mb-4" size={32} />
            <p className="text-slate-400">No announcements yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {announcements.map((announcement, i) => {
              const active = isActuallyActive(announcement)
              return (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <GlassCard glow={active ? 'cyan' : 'none'} className={`relative overflow-hidden ${active ? 'border-cyan-500/30' : 'opacity-80'}`}>
                    {active && (
                      <div className="absolute -top-6 -left-6 w-1 h-[calc(100%+3rem)] bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                    )}

                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {announcement.title}
                        {active && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] uppercase tracking-wider font-bold">
                            Active
                          </span>
                        )}
                      </h3>
                      <div className="shrink-0 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Calendar size={14} />
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <p className="text-slate-300 leading-relaxed mb-4 whitespace-pre-wrap">
                      {announcement.message}
                    </p>

                    {announcement.link_url && (
                      <a
                        href={announcement.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        Find out more <ExternalLink size={14} />
                      </a>
                    )}
                  </GlassCard>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
