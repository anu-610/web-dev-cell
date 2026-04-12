import { Link } from 'react-router-dom'
import GlassCard from './GlassCard'

interface Props {
  post: {
    id: string
    title: string
    author_name: string
    category: string
    thumbnail_url: string
    created_at: string
  }
}

const CATEGORY_COLORS: Record<string, string> = {
  'vulnerability': 'text-red-400 bg-red-400/10 border-red-400/20',
  'new-feature': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  'tutorial': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'news': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  'announcement': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  'other': 'text-slate-400 bg-slate-400/10 border-slate-400/20',
}

export default function PostCard({ post }: Props) {
  const date = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  const categoryColor = CATEGORY_COLORS[post.category] || CATEGORY_COLORS.other

  return (
    <Link to={`/posts/${post.id}`}>
      <GlassCard glow="cyan" className="h-full flex flex-col p-0 overflow-hidden group">
        <div className="relative h-48 w-full overflow-hidden border-b border-white/5 bg-void-900">
          <img
            src={post.thumbnail_url}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=No+Image' }}
          />
          <div className="absolute top-3 right-3">
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full border backdrop-blur-md ${categoryColor}`}>
              {post.category}
            </span>
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
            {post.title}
          </h3>
          <div className="mt-auto pt-4 flex items-center justify-between text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs">
                {post.author_name.charAt(0).toUpperCase()}
              </span>
              <span>{post.author_name}</span>
            </div>
            <span>{date}</span>
          </div>
        </div>
      </GlassCard>
    </Link>
  )
}
