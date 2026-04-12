import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react'
import DOMPurify from 'dompurify'
import { apiFetch } from '@/lib/api'

interface Post {
  id: string
  title: string
  content: string
  author_name: string
  category: string
  thumbnail_url: string
  created_at: string
}

export default function PostDetail() {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (id) fetchPost(id)
  }, [id])

  const fetchPost = async (postId: string) => {
    try {
      setLoading(true)
      const data = await apiFetch<Post>(`/posts/${postId}`)
      setPost(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-void-950 pt-32 text-center text-cyan-400">Loading post...</div>
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-void-950 pt-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-red-400 mb-4">Post Not Found</h1>
          <p className="text-slate-400 mb-8">{error}</p>
          <Link to="/posts" className="text-cyan-400 hover:underline flex items-center justify-center gap-2">
            <ArrowLeft size={16} /> Back to Posts
          </Link>
        </div>
      </div>
    )
  }

  const date = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Sanitize Quill HTML content
  const cleanHtml = DOMPurify.sanitize(post.content)

  return (
    <div className="min-h-screen bg-void-950 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link to="/posts" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-8">
          <ArrowLeft size={18} /> Back to blog
        </Link>

        <header className="mb-10">
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium mb-4">
            <Tag size={16} />
            <span className="uppercase tracking-wider">{post.category}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{post.author_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{date}</span>
            </div>
          </div>
        </header>

        <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 border border-white/10 shadow-2xl">
          <img
            src={post.thumbnail_url}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1200x600?text=No+Image' }}
          />
        </div>

        <article
          className="prose prose-invert prose-cyan max-w-none prose-img:rounded-xl prose-img:border prose-img:border-white/10 prose-headings:font-bold prose-a:text-cyan-400"
          dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />
      </div>
    </div>
  )
}
