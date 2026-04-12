import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react'
import NeonButton from '@/components/ui/NeonButton'
import GlassCard from '@/components/ui/GlassCard'
import SectionTitle from '@/components/ui/SectionTitle'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

const CATEGORIES = ["vulnerability", "new-feature", "tutorial", "news", "announcement", "other"]

function WritePostForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = !!id
  const { executeRecaptcha } = useGoogleReCaptcha()
  const { token, isAdmin } = useAuthStore()

  const [title, setTitle] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('')
  const [originalThumbnailUrl, setOriginalThumbnailUrl] = useState<string>('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [initialLoad, setInitialLoad] = useState(isEditMode)

  const editorRef = useRef<HTMLDivElement>(null)
  const quillRef = useRef<Quill | null>(null)

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: 'Write your post content here...',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
          ]
        }
      })
    }
  }, [])

  useEffect(() => {
    if (isEditMode) {
      apiFetch<any>(`/posts/${id}`).then(post => {
        setTitle(post.title)
        setAuthorName(post.author_name)
        setCategory(post.category)
        setOriginalThumbnailUrl(post.thumbnail_url)

        const thumbUrl = post.thumbnail_url.startsWith('http')
          ? post.thumbnail_url
          : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8000'}${post.thumbnail_url}`
        setThumbnailPreview(thumbUrl)

        if (quillRef.current) {
          quillRef.current.root.innerHTML = post.content
        }
        setInitialLoad(false)
      }).catch(err => {
        setError("Failed to load post for editing.")
        setInitialLoad(false)
      })
    }
  }, [id, isEditMode])

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setThumbnailFile(file)
      setThumbnailPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    if (!title || !authorName || !category) {
      setError("Please fill out all basic fields.")
      return
    }

    if (!thumbnailFile && !isEditMode) {
      setError("A thumbnail image is required.")
      return
    }

    const content = quillRef.current?.root.innerHTML
    if (!content || content === '<p><br></p>') {
      setError("Post content cannot be empty.")
      return
    }

    // Only non-admins creating new posts require reCAPTCHA
    const requiresRecaptcha = !isEditMode && (!token || !isAdmin)

    if (requiresRecaptcha && !executeRecaptcha) {
      setError("reCAPTCHA is not loaded yet. Please try again.")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      let recaptchaToken = ''
      if (requiresRecaptcha && executeRecaptcha) {
        recaptchaToken = await executeRecaptcha('submit_post')
      }

      let thumbnail_url = originalThumbnailUrl

      // Upload thumbnail if a new one was selected
      if (thumbnailFile) {
        const formData = new FormData()
        formData.append('file', thumbnailFile)

        const apiBaseUrl = import.meta.env.VITE_API_URL || '/api/v1'
        const uploadRes = await fetch(`${apiBaseUrl}/posts/upload-thumbnail`, {
          method: 'POST',
          body: formData
        })

        if (!uploadRes.ok) throw new Error("Failed to upload thumbnail.")
        const uploadData = await uploadRes.json()
        thumbnail_url = uploadData.url
      }

      if (isEditMode) {
        // Admin Edit Post
        await apiFetch(`/posts/${id}`, {
          method: 'PATCH',
          data: {
            title,
            content,
            author_name: authorName,
            category,
            thumbnail_url
          }
        })
      } else {
        // Submit New Post
        await apiFetch('/posts', {
          method: 'POST',
          data: {
            title,
            content,
            author_name: authorName,
            category,
            thumbnail_url,
            recaptcha_token: recaptchaToken || 'admin_bypass'
          }
        })
      }

      setSuccess(true)
      setTimeout(() => navigate(isEditMode ? '/admin' : '/posts'), 3000)

    } catch (err: any) {
      setError(err.message || 'Failed to save post.')
      setSubmitting(false)
    }
  }

  if (initialLoad) {
    return <div className="text-center p-12 text-cyan-400">Loading post data...</div>
  }

  if (success) {
    return (
      <GlassCard className="max-w-2xl mx-auto p-12 text-center flex flex-col items-center gap-6">
        <CheckCircle2 size={64} className="text-emerald-400" />
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{isEditMode ? 'Post Updated!' : 'Post Submitted!'}</h2>
          <p className="text-slate-400">
            {isEditMode ? 'The post has been successfully updated.' : 'Your post is now pending admin approval.'}
          </p>
        </div>
        <p className="text-sm text-slate-500">Redirecting...</p>
      </GlassCard>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <GlassCard className="p-6">
            <label className="block text-sm font-medium text-slate-400 mb-2">Post Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-void-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
              placeholder="e.g. New SSR Vulnerability Found in Next.js"
            />
          </GlassCard>

          <GlassCard className="p-6">
            <label className="block text-sm font-medium text-slate-400 mb-2">Content</label>
            <div className="bg-white text-black rounded-xl overflow-hidden min-h-[400px]">
              <div ref={editorRef} className="h-[400px]" />
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="font-bold text-white mb-4">Meta Data</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Author Name</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  className="w-full bg-void-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-void-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-bold text-white mb-4">Thumbnail Image</h3>

            <div className="relative border-2 border-dashed border-white/20 rounded-xl p-4 text-center hover:border-cyan-500/50 transition-colors cursor-pointer group">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleThumbnailChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {thumbnailPreview ? (
                <div className="relative w-full h-32 rounded-lg overflow-hidden">
                  <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-sm font-medium">Change Image</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center gap-2 text-slate-400 group-hover:text-cyan-400 transition-colors">
                  <Upload size={24} />
                  <span className="text-sm">Click or drag to upload</span>
                </div>
              )}
            </div>
          </GlassCard>

          <NeonButton
            type="submit"
            className="w-full justify-center"
            color="cyan"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : (isEditMode ? 'Update Post' : 'Submit for Review')}
          </NeonButton>
          {!isEditMode && (!token || !isAdmin) && (
            <p className="text-xs text-center text-slate-500 mt-4">
              This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy" className="underline">Privacy Policy</a> and <a href="https://policies.google.com/terms" className="underline">Terms of Service</a> apply.
            </p>
          )}
        </div>
      </div>
    </form>
  )
}

export default function WritePost() {
  const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY

  return (
    <div className="min-h-screen bg-void-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <SectionTitle title="Write a Post" subtitle="Share your knowledge with the community" />

        {recaptchaKey ? (
          <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
            <WritePostForm />
          </GoogleReCaptchaProvider>
        ) : (
          <div className="text-center p-12 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            Error: VITE_RECAPTCHA_SITE_KEY is not configured in .env
          </div>
        )}
      </div>
    </div>
  )
}
