import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PenSquare, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { apiFetch } from '@/lib/api'
import PostCard from '@/components/ui/PostCard'
import SectionTitle from '@/components/ui/SectionTitle'
import NeonButton from '@/components/ui/NeonButton'

interface Post {
  id: string
  title: string
  author_name: string
  category: string
  thumbnail_url: string
  created_at: string
}

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchPosts()
  }, [])

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

  return (
    <div className="min-h-screen bg-void-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
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
        ) : posts.length === 0 ? (
          <div className="text-center py-20 glass-strong rounded-2xl border border-white/5">
            <p className="text-slate-400 mb-4">No posts found.</p>
            <Link to="/posts/new">
              <span className="text-cyan-400 hover:underline cursor-pointer">Be the first to write one!</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
