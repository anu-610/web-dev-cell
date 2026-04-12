import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, ExternalLink } from 'lucide-react'
import { apiFetch } from '@/lib/api'

interface Announcement {
  id: string
  title: string
  message: string
  link_url: string | null
}

export default function AnnouncementPopup() {
  const [activeAnnouncements, setActiveAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    fetchActiveAnnouncements()
  }, [])

  const fetchActiveAnnouncements = async () => {
    try {
      const data = await apiFetch<Announcement[]>('/announcements/active')
      // Filter out dismissed announcements using localStorage
      const dismissed = JSON.parse(localStorage.getItem('dismissed_announcements') || '[]')
      const toShow = data.filter(a => !dismissed.includes(a.id))
      setActiveAnnouncements(toShow)
    } catch (e) {
      console.error('Failed to fetch announcements:', e)
    }
  }

  const dismiss = (id: string) => {
    const dismissed = JSON.parse(localStorage.getItem('dismissed_announcements') || '[]')
    if (!dismissed.includes(id)) {
      dismissed.push(id)
      localStorage.setItem('dismissed_announcements', JSON.stringify(dismissed))
    }
    setActiveAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="fixed top-24 right-6 z-[60] flex flex-col gap-4 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {activeAnnouncements.map(announcement => (
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="pointer-events-auto bg-void-900 border border-cyan-500/30 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.15)] overflow-hidden relative"
          >
            {/* Top glowing edge */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />

            <div className="p-4 flex gap-4">
              <div className="mt-1 shrink-0 text-cyan-400">
                <Bell size={20} />
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <h4 className="font-bold text-white text-sm mb-1">{announcement.title}</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {announcement.message}
                </p>
                {announcement.link_url && (
                  <a
                    href={announcement.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    View Details <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>

            <button
              onClick={() => dismiss(announcement.id)}
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
