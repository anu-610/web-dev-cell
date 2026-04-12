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
import { supabase } from '@/lib/supabase'

const CATEGORIES = ["vulnerability", "new-feature", "tutorial", "news", "announcement", "other"]

function GoogleSignInBlock() {
  const [oauthError, setOauthError] = useState<string | null>(null)

  useEffect(() => {
    // Supabase appends OAuth errors to the URL hash (e.g. #error=server_error&error_description=...)
    const hash = window.location.hash
    if (hash && hash.includes('error=')) {
      const params = new URLSearchParams(hash.replace('#', '?'))
      const errDesc = params.get('error_description')
      if (errDesc) {
        // Clean up the error message from Postgres trigger formatting if needed
        let cleanError = errDesc.replace(/\+/g, ' ')

        // If it's the generic Supabase error, replace it with our specific constraint message
        if (cleanError.includes('Database error saving new user')) {
          cleanError = 'Only IIT Mandi emails (@students.iitmandi.ac.in) are allowed to sign in.'
        } else {
          cleanError = cleanError.replace(/^.*EXCEPTION:\s*/, '')
        }

        setOauthError(cleanError || 'Authentication failed. Please try again.')
      }
      // Remove hash from URL to keep it clean
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [])

  const handleGoogleLogin = async () => {
    setOauthError(null)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/posts/new',
      },
    })
  }

  return (
    <div className="max-w-md mx-auto text-center mt-12">
      <GlassCard className="p-8">
        <h2 className="text-2xl font-bold mb-4">Student Login Required</h2>

        {oauthError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-left">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{oauthError}</span>
          </div>
        )}

        <p className="text-slate-400 mb-8 leading-relaxed">
          You must be an active student of IIT Mandi to publish a post on the WebDevCell blog.
        </p>
        <NeonButton onClick={handleGoogleLogin} className="w-full justify-center group flex items-center gap-3">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </NeonButton>
      </GlassCard>
    </div>
  )
}

function WritePostForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = !!id
  const { executeRecaptcha } = useGoogleReCaptcha()
  const { token, isAdmin, userName } = useAuthStore()

  const [title, setTitle] = useState('')
  const [authorName, setAuthorName] = useState(userName || '')
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
  }, [initialLoad]) // Re-run this effect when initialLoad completes so the editor mounts

  useEffect(() => {
    if (isEditMode) {
      apiFetch<any>(`/posts/${id}`).then(post => {
        setTitle(post.title)
        setAuthorName(post.author_name)
        setCategory(post.category)
        setOriginalThumbnailUrl(post.thumbnail_url)
        setThumbnailPreview(post.thumbnail_url)

        setInitialLoad(false)

        // Wait a tick for React to render the div, then initialize Quill
        setTimeout(() => {
          if (quillRef.current) {
            quillRef.current.root.innerHTML = post.content
          }
        }, 50)

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
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

    if (requiresRecaptcha && !isLocalhost && !executeRecaptcha) {
      setError("reCAPTCHA is not loaded yet. Please try again.")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      let recaptchaToken = isLocalhost ? 'local_bypass' : ''
      if (requiresRecaptcha && !isLocalhost && executeRecaptcha) {
        recaptchaToken = await executeRecaptcha('submit_post')
      }

      let thumbnail_url = originalThumbnailUrl

      // Upload thumbnail if a new one was selected
      if (thumbnailFile) {
        const formData = new FormData()
        formData.append('file', thumbnailFile)

        const uploadRes = await fetch('/api/v1/posts/upload-thumbnail', {
          method: 'POST',
          body: formData
        })

        if (!uploadRes.ok) throw new Error("Failed to upload thumbnail.")
        const uploadData = await uploadRes.json()
        thumbnail_url = uploadData.url
      }

      if (isEditMode) {
        // Admin or User Edit Post
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
      setTimeout(() => navigate(isAdmin ? '/admin' : '/posts'), 3000)

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
                  readOnly={!isAdmin && !isEditMode}
                  className={`w-full border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none ${!isAdmin && !isEditMode ? 'bg-void-950/50 cursor-not-allowed text-slate-400' : 'bg-void-900 focus:border-cyan-500/50'}`}
                  placeholder="Your Name"
                />
                {!isAdmin && !isEditMode && (
                  <p className="text-[10px] text-cyan-500/70 mt-1 uppercase tracking-wide">Synced from Google Profile</p>
                )}
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
  const { token, loading, isAdmin } = useAuthStore()

  // Prevent users from manually hitting /posts/edit/xyz if they aren't an admin
  const { id } = useParams<{ id: string }>()
  const isEditMode = !!id

  if (loading) {
    return <div className="min-h-screen bg-void-950 pt-24 text-center text-cyan-400">Verifying session...</div>
  }

  if (isEditMode && !token) {
    return (
      <div className="min-h-screen bg-void-950 pt-24 text-center text-red-400">
        You must be logged in to edit posts.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-void-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <SectionTitle title={isEditMode ? "Edit Post" : "Write a Post"} subtitle={isEditMode ? "Modify community post" : "Share your knowledge with the community"} />

        {!token && !isEditMode ? (
          <GoogleSignInBlock />
        ) : recaptchaKey ? (
          <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
            <WritePostForm />
          </GoogleReCaptchaProvider>
        ) : (
          <div className="text-center p-12 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 mt-12">
            Error: VITE_RECAPTCHA_SITE_KEY is not configured in .env
          </div>
        )}
      </div>
    </div>
  )
}
