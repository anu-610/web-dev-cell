import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Users, FolderKanban, Terminal, Plus, Trash2, Edit3, Save, X, Palette, FileText, CheckCircle, XCircle, Bell } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth'
import { apiFetch } from '@/lib/api'
import NeonButton from '@/components/ui/NeonButton'
import GlassCard from '@/components/ui/GlassCard'
import { useThemeStore, type HeroTheme } from '@/stores/themeStore'
import type { TeamMember } from '@/components/sections/Team'
import type { Project } from '@/components/sections/Projects'

type Tab = 'members' | 'projects' | 'theme' | 'posts' | 'announcements'

const THEMES: { id: HeroTheme; label: string; icon: string; desc: string }[] = [
  { id: 'aurora',  icon: '🌌', label: 'Aurora',  desc: 'Floating particle field with animated aurora glow blobs' },
  { id: 'mesh',    icon: '🎨', label: 'Mesh',    desc: 'Animated CSS gradient mesh with typewriter taglines' },
  { id: 'circuit', icon: '⚡', label: 'Circuit', desc: 'SVG circuit board with flowing current and pulsing nodes' },
]

export default function AdminDashboard() {
  const { token, isAdmin, logout, checkSession, loading } = useAuthStore()
  const { heroTheme, setHeroTheme } = useThemeStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('members')

  const [members, setMembers] = useState<TeamMember[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const defaultStats = [
    { value: '20+', label: 'Projects Shipped' },
    { value: '30+', label: 'Active Members' },
    { value: '3+',  label: 'Years Running' },
    { value: '∞',   label: 'Coffee Consumed' },
  ]
  const [siteSettings, setSiteSettings] = useState<any>({ hero_theme: 'aurora', show_github_stats: false, github_repo: 'kamandprompt/dev-cell', hero_stats: defaultStats })
  const [isFetching, setIsFetching] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  // Edit states
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [editForm, setEditForm] = useState<any>({})

  useEffect(() => {
    checkSession()
  }, [checkSession])

  useEffect(() => {
    if (!loading && (!token || !isAdmin)) {
      navigate('/admin/login')
    }
  }, [token, isAdmin, loading, navigate])

  useEffect(() => {
    if (token) fetchData()
  }, [token])

  const fetchData = async () => {
    setIsFetching(true)
    try {
      const results = await Promise.allSettled([
        apiFetch<TeamMember[]>('/members'),
        apiFetch<Project[]>('/projects'),
        apiFetch<any[]>('/posts/admin/all'),
        apiFetch<any[]>('/announcements'),
        apiFetch<any>('/settings/site')
      ])

      if (results[0].status === 'fulfilled') setMembers(results[0].value)
      if (results[1].status === 'fulfilled') setProjects(results[1].value)
      if (results[2].status === 'fulfilled') setPosts(results[2].value)
      if (results[3].status === 'fulfilled') setAnnouncements(results[3].value)
      if (results[4].status === 'fulfilled') {
        setSiteSettings(results[4].value)
        setHeroTheme(results[4].value.hero_theme)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsFetching(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (!e.target.files || !e.target.files[0]) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', e.target.files[0])
      const res = await fetch('/api/v1/posts/upload-thumbnail', {
        method: 'POST',
        body: formData
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      setEditForm({ ...editForm, [field]: data.url })
    } catch (err) {
      alert('Error uploading image')
    } finally {
      setIsUploading(false)
    }
  }

  // Timezone-safe local datetime string for the HTML input
  const toLocalDatetimeLocal = (isoString?: string) => {
    if (!isoString) return ''
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return ''
    const tzOffset = d.getTimezoneOffset() * 60000
    return new Date(d.getTime() - tzOffset).toISOString().substring(0, 16)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const handlePostStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      let rejection_reason = undefined
      if (status === 'rejected') {
        const reason = window.prompt("Reason for rejection:")
        if (reason === null) return // Cancelled
        rejection_reason = reason
      }

      await apiFetch(`/posts/${id}/status`, {
        method: 'PATCH',
        data: { status, rejection_reason }
      })
      fetchData()
    } catch (e) {
      alert(`Error updating post status`)
    }
  }

  // Generic Save (Create/Update)
  const handleSave = async (type: Tab) => {
    try {
      if (type === 'members') {
        if (editingId === 'new') {
          await apiFetch('/members', { method: 'POST', data: editForm })
        } else {
          await apiFetch(`/members/${editingId}`, { method: 'PATCH', data: editForm })
        }
      } else if (type === 'projects') {
        if (editingId === 'new') {
          await apiFetch('/projects', { method: 'POST', data: editForm })
        } else {
          await apiFetch(`/projects/${editingId}`, { method: 'PATCH', data: editForm })
        }
      } else if (type === 'announcements') {
        const payload = { ...editForm }
        if (payload.end_date_local) {
          payload.end_date = new Date(payload.end_date_local).toISOString()
          delete payload.end_date_local
        }
        if (editingId === 'new') {
          await apiFetch('/announcements', { method: 'POST', data: payload })
        } else {
          await apiFetch(`/announcements/${editingId}`, { method: 'PATCH', data: payload })
        }
      }
      setEditingId(null)
      fetchData()
    } catch (e) {
      alert(`Error saving ${type}`)
    }
  }

  // Generic Delete
  const handleDelete = async (type: Tab, id: string | number) => {
    if (!window.confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) return
    try {
      await apiFetch(`/${type}/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (e) {
      alert(`Error deleting ${type}`)
    }
  }

  if (loading || !token) {
    return <div className="min-h-[calc(100vh-4rem)] bg-void-950 flex items-center justify-center text-cyan-400">Verifying session...</div>
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-void-950 text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 glass-strong border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
            <Terminal size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg">Admin<span className="neon-cyan">Panel</span></span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => { setTab('members'); setEditingId(null) }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${tab === 'members' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Users size={18} /> Team Members
          </button>
          <button
            onClick={() => { setTab('projects'); setEditingId(null) }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${tab === 'projects' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <FolderKanban size={18} /> Projects
          </button>
          <button
            onClick={() => { setTab('posts'); setEditingId(null) }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${tab === 'posts' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <FileText size={18} /> Blog Posts
          </button>
          <button
            onClick={() => { setTab('announcements'); setEditingId(null) }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${tab === 'announcements' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Bell size={18} /> Announcements
          </button>
          <button
            onClick={() => { setTab('theme'); setEditingId(null) }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${tab === 'theme' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Palette size={18} /> Site Settings
          </button>
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* ── Theme Panel ── */}
        {tab === 'theme' ? (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <Palette size={22} className="text-cyan-400" />
              <h1 className="text-2xl font-bold">Site Settings</h1>
            </div>

            <GlassCard className="p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">GitHub Open Source Stats</h2>
              <p className="text-sm text-slate-400 mb-6">Display a live GitHub widget on the homepage tracking repository stats.</p>

              <div className="flex flex-col gap-4 max-w-md">
                <label className="flex items-center gap-3 text-white">
                  <input
                    type="checkbox"
                    checked={siteSettings.show_github_stats}
                    onChange={async (e) => {
                      const checked = e.target.checked
                      setSiteSettings({ ...siteSettings, show_github_stats: checked })
                      await apiFetch('/settings/site', { method: 'PATCH', data: { show_github_stats: checked } })
                    }}
                    className="w-5 h-5 rounded bg-void-800 border-void-700"
                  />
                  Enable Live GitHub Stats
                </label>

                {siteSettings.show_github_stats && (
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Target Repository (owner/repo)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={siteSettings.github_repo || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, github_repo: e.target.value })}
                        className="flex-1 bg-void-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                      />
                      <NeonButton
                        size="sm"
                        onClick={async () => {
                          await apiFetch('/settings/site', { method: 'PATCH', data: { github_repo: siteSettings.github_repo } })
                          alert("Repository updated!")
                        }}
                      >
                        Save Repo
                      </NeonButton>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>

            <h2 className="text-xl font-bold mb-4 mt-8">Hero Statistics</h2>
            <p className="text-sm text-slate-400 mb-6">Customize the 4 statistics displayed on the homepage hero section.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mb-6">
              {(siteSettings.hero_stats || defaultStats).map((stat: any, index: number) => (
                <GlassCard key={index} className="p-4 flex flex-col gap-3 border-white/5">
                  <div className="text-sm font-bold text-slate-300">Stat #{index + 1}</div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Value (e.g. 20+)</label>
                    <input 
                      type="text" 
                      value={stat.value} 
                      onChange={(e) => {
                        const newStats = [...(siteSettings.hero_stats || defaultStats)]
                        newStats[index] = { ...newStats[index], value: e.target.value }
                        setSiteSettings({ ...siteSettings, hero_stats: newStats })
                      }}
                      className="w-full bg-void-900 border border-white/10 rounded px-3 py-1.5 text-white text-sm focus:border-cyan-500/50 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Label (e.g. Projects Shipped)</label>
                    <input 
                      type="text" 
                      value={stat.label} 
                      onChange={(e) => {
                        const newStats = [...(siteSettings.hero_stats || defaultStats)]
                        newStats[index] = { ...newStats[index], label: e.target.value }
                        setSiteSettings({ ...siteSettings, hero_stats: newStats })
                      }}
                      className="w-full bg-void-900 border border-white/10 rounded px-3 py-1.5 text-white text-sm focus:border-cyan-500/50 outline-none transition-colors"
                    />
                  </div>
                </GlassCard>
              ))}
            </div>
            <NeonButton 
              size="sm" 
              className="mb-12"
              onClick={async () => {
                await apiFetch('/settings/site', { method: 'PATCH', data: { hero_stats: siteSettings.hero_stats || defaultStats } })
                alert("Hero stats updated live!")
              }}
            >
              Save Hero Stats
            </NeonButton>

            <div className="w-full h-px bg-white/10 mb-8" />

            <h2 className="text-xl font-bold mb-4">Hero Theme</h2>
            <p className="text-slate-400 mb-8 text-sm">
              Choose the visual style for the homepage hero section.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {THEMES.map((t) => (
                <motion.button
                  key={t.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    setHeroTheme(t.id)
                    setSiteSettings({ ...siteSettings, hero_theme: t.id })
                    await apiFetch('/settings/site', { method: 'PATCH', data: { hero_theme: t.id } })
                  }}
                  className={`relative p-6 rounded-2xl border text-left transition-all duration-200 ${
                    heroTheme === t.id
                      ? 'border-cyan-500/60 bg-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                  }`}
                >
                  {heroTheme === t.id && (
                    <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  )}
                  <div className="text-4xl mb-4">{t.icon}</div>
                  <h3 className="font-bold text-white text-lg mb-1">{t.label}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{t.desc}</p>
                  {heroTheme === t.id && (
                    <div className="mt-4 text-xs font-mono text-cyan-400 tracking-widest uppercase">✓ Active</div>
                  )}
                </motion.button>
              ))}
            </div>
            <div className="mt-8 p-4 rounded-xl border border-white/5 bg-white/3">
              <p className="text-xs text-slate-500 font-mono">
                💡 Theme changes are saved to <code className="text-cyan-600">localStorage</code> and take effect immediately on the homepage.
                Visitors see whatever theme was last set.
              </p>
            </div>
          </div>
        ) : tab === 'posts' ? (
          /* ── Posts Panel ── */
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <FileText size={22} className="text-cyan-400" />
                <h1 className="text-2xl font-bold">Blog Posts Moderation</h1>
              </div>
              <NeonButton
                size="sm"
                onClick={() => navigate('/posts/new')}
              >
                <Plus size={16} /> Add New
              </NeonButton>
            </div>

            {isFetching ? (
              <div className="text-slate-500">Loading posts...</div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <GlassCard key={post.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                          post.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                          post.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {post.status}
                        </span>
                        <span className="text-xs text-slate-400 border border-white/10 rounded px-2">{post.category}</span>
                      </div>
                      <h3 className="font-bold text-white text-lg leading-tight mb-1">{post.title}</h3>
                      <p className="text-sm text-slate-400">By {post.author_name} • {new Date(post.created_at).toLocaleDateString()}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {post.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handlePostStatus(post.id, 'approved')}
                            className="p-2 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg flex items-center gap-2 text-sm"
                          >
                            <CheckCircle size={16} /> Approve
                          </button>
                          <button
                            onClick={() => handlePostStatus(post.id, 'rejected')}
                            className="p-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center gap-2 text-sm"
                          >
                            <XCircle size={16} /> Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => navigate(`/posts/edit/${post.id}`)}
                        className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                        title="Edit Post"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete('posts', post.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Post"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </GlassCard>
                ))}

                {posts.length === 0 && !isFetching && (
                  <div className="text-center py-12 text-slate-500">No blog posts found.</div>
                )}
              </div>
            )}
          </div>
        ) : tab === 'announcements' ? (
          /* ── Announcements Panel ── */
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Bell size={22} className="text-cyan-400" />
                <h1 className="text-2xl font-bold">Announcements</h1>
              </div>
              <NeonButton
                size="sm"
                onClick={() => {
                  setEditingId('new')
                  setEditForm({
                    title: '',
                    message: '',
                    link_url: '',
                    end_date_local: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T23:59',
                    is_active: true
                  })
                }}
                disabled={editingId !== null}
              >
                <Plus size={16} /> Add New
              </NeonButton>
            </div>

            {isFetching ? (
              <div className="text-slate-500">Loading announcements...</div>
            ) : (
              <div className="space-y-4">
                {announcements.map((item: any) => (
                  <GlassCard key={item.id} className="p-4 flex items-center justify-between">
                    {editingId === item.id ? (
                      /* Edit Form Row */
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mr-4">
                        <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} placeholder="Title" />
                        <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.message || ''} onChange={e => setEditForm({...editForm, message: e.target.value})} placeholder="Message" />
                        <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.link_url || ''} onChange={e => setEditForm({...editForm, link_url: e.target.value})} placeholder="Link URL (optional)" />
                        <div className="flex flex-col gap-2">
                          <input type="datetime-local" className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.end_date_local || ''} onChange={e => setEditForm({...editForm, end_date_local: e.target.value})} />
                          <label className="flex items-center gap-2 text-sm text-slate-400">
                            <input type="checkbox" checked={editForm.is_active || false} onChange={e => setEditForm({...editForm, is_active: e.target.checked})} className="rounded bg-void-800 border-void-700" />
                            Active Popup
                          </label>
                        </div>
                      </div>
                    ) : (
                      /* Display Row */
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                            item.is_active && new Date(item.end_date).getTime() >= Date.now()
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-slate-500/20 text-slate-400'
                          }`}>
                            {item.is_active && new Date(item.end_date).getTime() >= Date.now() ? 'Active' : 'Inactive / Expired'}
                          </span>
                          <span className="text-xs text-slate-400">Ends: {new Date(item.end_date).toLocaleString()}</span>
                        </div>
                        <h3 className="font-bold text-white mb-1">{item.title}</h3>
                        <p className="text-sm text-slate-400 line-clamp-1">{item.message}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {editingId === item.id ? (
                        <>
                          <button onClick={() => handleSave('announcements')} className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg"><Save size={18} /></button>
                          <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:bg-slate-500/10 rounded-lg"><X size={18} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => {
                            setEditingId(item.id);
                            setEditForm({
                              ...item,
                              end_date_local: toLocalDatetimeLocal(item.end_date)
                            })
                          }} className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg" disabled={editingId !== null}><Edit3 size={18} /></button>
                          <button onClick={() => handleDelete('announcements', item.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg" disabled={editingId !== null}><Trash2 size={18} /></button>
                        </>
                      )}
                    </div>
                  </GlassCard>
                ))}

                {/* Create New Form Row */}
                {editingId === 'new' && (
                  <GlassCard className="p-4 flex items-center justify-between border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mr-4">
                      <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} placeholder="Title" />
                      <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.message || ''} onChange={e => setEditForm({...editForm, message: e.target.value})} placeholder="Message" />
                      <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.link_url || ''} onChange={e => setEditForm({...editForm, link_url: e.target.value})} placeholder="Link URL (optional)" />
                      <div className="flex flex-col gap-2">
                        <input type="datetime-local" className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.end_date_local || ''} onChange={e => setEditForm({...editForm, end_date_local: e.target.value})} />
                        <label className="flex items-center gap-2 text-sm text-slate-400">
                          <input type="checkbox" checked={editForm.is_active || false} onChange={e => setEditForm({...editForm, is_active: e.target.checked})} className="rounded bg-void-800 border-void-700" />
                          Active Popup
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => handleSave('announcements')} className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg"><Save size={18} /></button>
                      <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:bg-slate-500/10 rounded-lg"><X size={18} /></button>
                    </div>
                  </GlassCard>
                )}

                {announcements.length === 0 && editingId !== 'new' && !isFetching && (
                  <div className="text-center py-12 text-slate-500">No announcements found.</div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ── Members / Projects Panel ── */
          <div>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold capitalize">{tab} Management</h1>
              <NeonButton
                size="sm"
                onClick={() => {
                  setEditingId('new')
                  setEditForm(tab === 'members' ? { is_active: true } : { is_active: true, featured: false })
                }}
                disabled={editingId !== null}
              >
                <Plus size={16} /> Add New
              </NeonButton>
            </div>

            {isFetching ? (
              <div className="text-slate-500">Loading data...</div>
            ) : (
              <div className="space-y-4">
                {(tab === 'members' ? members : projects).map((item: any) => (
                  <GlassCard key={item.id} className="p-4 flex items-center justify-between">
                    {editingId === item.id ? (
                      /* Edit Form Row */
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 mr-4">
                        {tab === 'members' ? (
                          <>
                            <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Name" />
                            <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.role || ''} onChange={e => setEditForm({...editForm, role: e.target.value})} placeholder="Role" />
                            <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.github_url || ''} onChange={e => setEditForm({...editForm, github_url: e.target.value})} placeholder="GitHub URL" />
                            <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.linkedin_url || ''} onChange={e => setEditForm({...editForm, linkedin_url: e.target.value})} placeholder="LinkedIn URL" />
                            <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.instagram_url || ''} onChange={e => setEditForm({...editForm, instagram_url: e.target.value})} placeholder="Instagram URL" />

                            <div className="md:col-span-5 flex items-center gap-4">
                              {editForm.avatar_url && <img src={editForm.avatar_url} className="w-10 h-10 rounded-full object-cover" />}
                              <label className="text-sm text-cyan-400 cursor-pointer hover:underline">
                                {isUploading ? 'Uploading...' : 'Upload Avatar Image'}
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar_url')} />
                              </label>
                            </div>
                          </>
                        ) : (
                          <>
                            <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} placeholder="Title" />
                            <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.tags || ''} onChange={e => setEditForm({...editForm, tags: e.target.value})} placeholder="Tags (comma separated)" />
                            <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.github_url || ''} onChange={e => setEditForm({...editForm, github_url: e.target.value})} placeholder="GitHub URL" />
                            <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.live_url || ''} onChange={e => setEditForm({...editForm, live_url: e.target.value})} placeholder="Live URL" />
                            <label className="flex items-center gap-2 text-sm text-slate-400">
                              <input type="checkbox" checked={editForm.featured || false} onChange={e => setEditForm({...editForm, featured: e.target.checked})} className="rounded bg-void-800 border-void-700" />
                              Featured
                            </label>

                            <div className="md:col-span-5 flex items-center gap-4 mt-2">
                              {editForm.thumbnail_url && <img src={editForm.thumbnail_url} className="w-16 h-10 rounded object-cover" />}
                              <label className="text-sm text-cyan-400 cursor-pointer hover:underline">
                                {isUploading ? 'Uploading...' : 'Upload Project Thumbnail'}
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'thumbnail_url')} />
                              </label>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      /* Display Row */
                      <div className="flex-1">
                        <h3 className="font-bold text-white">{tab === 'members' ? item.name : item.title}</h3>
                        <p className="text-sm text-slate-400">{tab === 'members' ? item.role : item.tags}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {editingId === item.id ? (
                        <>
                          <button onClick={() => handleSave(tab as 'members' | 'projects')} className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg"><Save size={18} /></button>
                          <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:bg-slate-500/10 rounded-lg"><X size={18} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingId(item.id); setEditForm(item) }} className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg" disabled={editingId !== null}><Edit3 size={18} /></button>
                          <button onClick={() => handleDelete(tab as 'members' | 'projects', item.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg" disabled={editingId !== null}><Trash2 size={18} /></button>
                        </>
                      )}
                    </div>
                  </GlassCard>
                ))}

                {/* Create New Form Row */}
                {editingId === 'new' && (
                  <GlassCard className="p-4 flex items-center justify-between border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 mr-4">
                      {tab === 'members' ? (
                        <>
                          <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Name" />
                          <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.role || ''} onChange={e => setEditForm({...editForm, role: e.target.value})} placeholder="Role" />
                          <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.github_url || ''} onChange={e => setEditForm({...editForm, github_url: e.target.value})} placeholder="GitHub URL" />
                          <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.linkedin_url || ''} onChange={e => setEditForm({...editForm, linkedin_url: e.target.value})} placeholder="LinkedIn URL" />
                          <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.instagram_url || ''} onChange={e => setEditForm({...editForm, instagram_url: e.target.value})} placeholder="Instagram URL" />

                          <div className="md:col-span-5 flex items-center gap-4 mt-2">
                            {editForm.avatar_url && <img src={editForm.avatar_url} className="w-10 h-10 rounded-full object-cover" />}
                            <label className="text-sm text-cyan-400 cursor-pointer hover:underline">
                              {isUploading ? 'Uploading...' : 'Upload Avatar Image'}
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar_url')} />
                            </label>
                          </div>
                        </>
                      ) : (
                        <>
                          <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} placeholder="Title" />
                          <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.tags || ''} onChange={e => setEditForm({...editForm, tags: e.target.value})} placeholder="Tags (comma separated)" />
                          <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.github_url || ''} onChange={e => setEditForm({...editForm, github_url: e.target.value})} placeholder="GitHub URL" />
                          <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.live_url || ''} onChange={e => setEditForm({...editForm, live_url: e.target.value})} placeholder="Live URL" />
                          <label className="flex items-center gap-2 text-sm text-slate-400">
                            <input type="checkbox" checked={editForm.featured || false} onChange={e => setEditForm({...editForm, featured: e.target.checked})} className="rounded bg-void-800 border-void-700" />
                            Featured
                          </label>

                          <div className="md:col-span-5 flex items-center gap-4 mt-2">
                            {editForm.thumbnail_url && <img src={editForm.thumbnail_url} className="w-16 h-10 rounded object-cover" />}
                            <label className="text-sm text-cyan-400 cursor-pointer hover:underline">
                              {isUploading ? 'Uploading...' : 'Upload Project Thumbnail'}
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'thumbnail_url')} />
                            </label>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleSave(tab as 'members' | 'projects')} className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg"><Save size={18} /></button>
                      <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:bg-slate-500/10 rounded-lg"><X size={18} /></button>
                    </div>
                  </GlassCard>
                )}

                {(tab === 'members' ? members : projects).length === 0 && editingId !== 'new' && !isFetching && (
                  <div className="text-center py-12 text-slate-500">No {tab} found. Click Add New to create one.</div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

