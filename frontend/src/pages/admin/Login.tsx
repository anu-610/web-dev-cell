import { useState } from 'react'
import { motion } from 'framer-motion'
import { Terminal, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import NeonButton from '@/components/ui/NeonButton'
import GlassCard from '@/components/ui/GlassCard'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else if (data.session) {
      setAuth(data.session.access_token, true)
      navigate('/admin')
    }
    setLoading(false)
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
          </form>
        </GlassCard>
      </motion.div>
    </div>
  )
}
