import { useState } from 'react'
import { motion } from 'framer-motion'
import { Terminal, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { apiFetch } from '@/lib/api'
import NeonButton from '@/components/ui/NeonButton'
import GlassCard from '@/components/ui/GlassCard'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const { executeRecaptcha } = useGoogleReCaptcha()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      let token = 'local_bypass'

      // 1. Execute reCAPTCHA if not local
      if (!isLocalhost) {
        if (!executeRecaptcha) {
          throw new Error('reCAPTCHA is not loaded yet. Please try again.')
        }
        token = await executeRecaptcha('admin_login')
      }

      // 2. Verify token with our backend
      await apiFetch('/settings/verify-recaptcha', {
        method: 'POST',
        data: { recaptcha_token: token }
      })

      // 3. Authenticate with Supabase
      const { data, error: supaError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (supaError) {
        throw new Error(supaError.message)
      } else if (data.session) {
        setAuth(data.session.access_token, true)
        window.location.href = '/admin' // Force reload to trigger session checks properly
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-void-950 flex flex-col items-center justify-center p-4">
      {/* Branding */}
      <div className="mb-8 flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
          <Terminal size={20} className="text-white" />
        </div>
        <span className="font-bold text-2xl text-white">Web<span className="neon-cyan">Dev</span>Cell</span>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <GlassCard className="p-8">
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <Lock className="text-cyan-400" size={24} />
            <h1 className="text-xl font-bold text-white">Admin Login</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-void-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-void-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                required
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <NeonButton type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </NeonButton>

            <p className="text-xs text-center text-slate-500 mt-4">
              Protected by reCAPTCHA. Google <a href="https://policies.google.com/privacy" className="underline">Privacy Policy</a> and <a href="https://policies.google.com/terms" className="underline">Terms of Service</a> apply.
            </p>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  )
}

export default function Login() {
  const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY

  if (!recaptchaKey) {
    return (
      <div className="min-h-screen bg-void-950 flex items-center justify-center p-4">
        <div className="text-center p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          Error: VITE_RECAPTCHA_SITE_KEY is not configured.
        </div>
      </div>
    )
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
      <LoginForm />
    </GoogleReCaptchaProvider>
  )
}
