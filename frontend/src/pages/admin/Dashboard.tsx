import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Users, FolderKanban, Terminal, Plus, Trash2, Edit3, Save, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth'
import { apiFetch } from '@/lib/api'
import NeonButton from '@/components/ui/NeonButton'
import GlassCard from '@/components/ui/GlassCard'
import type { TeamMember } from '@/components/sections/Team'
import type { Project } from '@/components/sections/Projects'

type Tab = 'members' | 'projects'

export default function AdminDashboard() {
  const { token, isAdmin, logout, checkSession, loading } = useAuthStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('members')

  const [members, setMembers] = useState<TeamMember[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isFetching, setIsFetching] = useState(true)

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
      const [m, p] = await Promise.all([
        apiFetch<TeamMember[]>('/members'),
        apiFetch<Project[]>('/projects')
      ])
      setMembers(m)
      setProjects(p)
    } catch (e) {
      console.error(e)
    } finally {
      setIsFetching(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  // Generic Save (Create/Update)
  const handleSave = async (type: Tab) => {
    try {
      if (type === 'members') {
        if (editingId === 'new') {
          await apiFetch('/members/', { method: 'POST', data: editForm })
        } else {
          await apiFetch(`/members/${editingId}`, { method: 'PATCH', data: editForm })
        }
      } else {
        if (editingId === 'new') {
          await apiFetch('/projects/', { method: 'POST', data: editForm })
        } else {
          await apiFetch(`/projects/${editingId}`, { method: 'PATCH', data: editForm })
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
    return <div className="min-h-screen bg-void-950 flex items-center justify-center text-cyan-400">Verifying session...</div>
  }

  return (
    <div className="min-h-screen bg-void-950 text-white flex flex-col md:flex-row">
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
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
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
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 mr-4">
                    {tab === 'members' ? (
                      <>
                        <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Name" />
                        <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.role || ''} onChange={e => setEditForm({...editForm, role: e.target.value})} placeholder="Role" />
                        <input className="bg-void-800 p-2 rounded text-sm text-white" type="number" value={editForm.year || ''} onChange={e => setEditForm({...editForm, year: parseInt(e.target.value)})} placeholder="Year" />
                        <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.github_url || ''} onChange={e => setEditForm({...editForm, github_url: e.target.value})} placeholder="GitHub URL" />
                      </>
                    ) : (
                      <>
                        <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} placeholder="Title" />
                        <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.tags || ''} onChange={e => setEditForm({...editForm, tags: e.target.value})} placeholder="Tags (comma separated)" />
                        <label className="flex items-center gap-2 text-sm text-slate-400">
                          <input type="checkbox" checked={editForm.featured || false} onChange={e => setEditForm({...editForm, featured: e.target.checked})} className="rounded bg-void-800 border-void-700" />
                          Featured
                        </label>
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
                      <button onClick={() => handleSave(tab)} className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg"><Save size={18} /></button>
                      <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:bg-slate-500/10 rounded-lg"><X size={18} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingId(item.id); setEditForm(item) }} className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg" disabled={editingId !== null}><Edit3 size={18} /></button>
                      <button onClick={() => handleDelete(tab, item.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg" disabled={editingId !== null}><Trash2 size={18} /></button>
                    </>
                  )}
                </div>
              </GlassCard>
            ))}

            {/* Create New Form Row */}
            {editingId === 'new' && (
              <GlassCard className="p-4 flex items-center justify-between border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 mr-4">
                  {tab === 'members' ? (
                    <>
                      <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Name" />
                      <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.role || ''} onChange={e => setEditForm({...editForm, role: e.target.value})} placeholder="Role" />
                      <input className="bg-void-800 p-2 rounded text-sm text-white" type="number" value={editForm.year || ''} onChange={e => setEditForm({...editForm, year: parseInt(e.target.value)})} placeholder="Year" />
                      <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.github_url || ''} onChange={e => setEditForm({...editForm, github_url: e.target.value})} placeholder="GitHub URL" />
                    </>
                  ) : (
                    <>
                      <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} placeholder="Title" />
                      <input className="bg-void-800 p-2 rounded text-sm text-white" value={editForm.tags || ''} onChange={e => setEditForm({...editForm, tags: e.target.value})} placeholder="Tags (comma separated)" />
                      <label className="flex items-center gap-2 text-sm text-slate-400">
                        <input type="checkbox" checked={editForm.featured || false} onChange={e => setEditForm({...editForm, featured: e.target.checked})} className="rounded bg-void-800 border-void-700" />
                        Featured
                      </label>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleSave(tab)} className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg"><Save size={18} /></button>
                  <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:bg-slate-500/10 rounded-lg"><X size={18} /></button>
                </div>
              </GlassCard>
            )}

            {(tab === 'members' ? members : projects).length === 0 && editingId !== 'new' && !isFetching && (
              <div className="text-center py-12 text-slate-500">No {tab} found. Click Add New to create one.</div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
