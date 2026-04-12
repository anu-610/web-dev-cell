import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PenSquare, AlertCircle, Edit3, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { apiFetch } from '@/lib/api'
import PostCard from '@/components/ui/PostCard'
import SectionTitle from '@/components/ui/SectionTitle'
import NeonButton from '@/components/ui/NeonButton'
import { useAuthStore } from '@/stores/auth'

interface Post {
  id: string
  title: string
  author_name: string
  category: string
  thumbnail_url: string
  created_at: string
  status?: string
  rejection_reason?: string
}

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [myPosts, setMyPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'all' | 'my'>('all')
  const { token, isAdmin } = useAuthStore()

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchPosts()
  }, [])

  useEffect(() => {
    if (tab === 'my') fetchMyPosts()
  }, [tab])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<Post[]>('/posts')
      setPosts(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const fetchMyPosts = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<Post[]>('/posts/me')
      setMyPosts(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load your posts')
    } finally {
      setLoading(false)
    }
  }

  const currentPosts = tab === 'all' ? posts : myPosts

  return (
    <div className="min-h-screen bg-void-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <SectionTitle title="Dev Blog" subtitle="Latest updates, vulnerabilities, and tutorials" />
          </div>
          <Link to="/posts/new">
            <NeonButton color="cyan">
              <span className="flex items-center gap-2">
                <PenSquare size={18} />
                Write a Post
              </span>
            </NeonButton>
          </Link>
        </div>

        {token && !isAdmin && (
          <div className="flex items-center gap-6 mb-10 border-b border-white/10 pb-px">
            <button
              onClick={() => setTab('all')}
              className={`pb-3 text-sm font-medium transition-colors relative ${tab === 'all' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}
            >
              All Posts
              {tab === 'all' && <motion.div layoutId="postTab" className="absolute -bottom-px left-0 right-0 h-0.5 bg-cyan-400" />}
            </button>
            <button
              onClick={() => setTab('my')}
              className={`pb-3 text-sm font-medium transition-colors relative ${tab === 'my' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}
            >
              My Posts
              {tab === 'my' && <motion.div layoutId="postTab" className="absolute -bottom-px left-0 right-0 h-0.5 bg-cyan-400" />}
            </button>
          </div>
        )}

        {error ? (
          <div className="p-6 border border-red-500/20 bg-red-500/10 rounded-xl flex items-center gap-3 text-red-400">
            <AlertCircle />
            <span>{error}</span>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : currentPosts.length === 0 ? (
          <div className="text-center py-20 glass-strong rounded-2xl border border-white/5">
            <p className="text-slate-400 mb-4">No posts found.</p>
            {tab === 'all' && (
              <Link to="/posts/new">
                <span className="text-cyan-400 hover:underline cursor-pointer">Be the first to write one!</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <PostCard post={post} />

                {tab === 'my' && post.status && (
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg backdrop-blur-md border w-fit ${
                      post.status === 'approved' ? 'bg-emerald-500/90 text-white border-emerald-400/50' :
                      post.status === 'rejected' ? 'bg-red-500/90 text-white border-red-400/50' :
                      'bg-amber-500/90 text-white border-amber-400/50'
                    }`}>
                      {post.status === 'approved' && <CheckCircle2 size={12} />}
                      {post.status === 'rejected' && <XCircle size={12} />}
                      {post.status === 'pending' && <Clock size={12} />}
                      {post.status}
                    </span>
                    {post.status === 'rejected' && post.rejection_reason && (
                      <div className="text-xs bg-void-950/90 text-red-400 p-2 rounded-lg border border-red-500/30 backdrop-blur-md shadow-lg max-w-[200px]">
                        <span className="font-bold block mb-1">Reason:</span>
                        {post.rejection_reason}
                      </div>
                    )}
                  </div>
                )}

                {tab === 'my' && (
                  <Link to={`/posts/edit/${post.id}`} className="absolute top-4 right-4 z-10">
                    <button className="w-8 h-8 rounded-full bg-void-950/80 border border-white/10 text-slate-300 flex items-center justify-center hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/30 transition-all backdrop-blur-md shadow-lg" title="Edit Post">
                      <Edit3 size={14} />
                    </button>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
