import { motion } from 'framer-motion'
import { GitBranch, Mail, Terminal, Heart } from 'lucide-react'

const LINKS = [
  { label: 'Projects', id: 'projects' },
  { label: 'Team', id: 'team' },
]

export default function Footer() {
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <footer id="contact" className="relative border-t border-white/5 pt-12 sm:pt-16 pb-8 section-pad overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-40 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
                <Terminal size={16} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg">Web<span className="neon-cyan">Dev</span>Cell</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              A sub-club of KamandPrompt — the programming club at IIT Mandi. Building the open web, together.
            </p>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-xs font-mono text-slate-400 tracking-widest uppercase mb-4">Navigate</h4>
            <ul className="space-y-2">
              {LINKS.map(l => (
                <li key={l.id}>
                  <button onClick={() => go(l.id)} className="text-slate-500 hover:text-cyan-400 text-sm transition-colors">{l.label}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-mono text-slate-400 tracking-widest uppercase mb-4">Connect</h4>
            <div className="flex gap-3">
              {[
                { icon: GitBranch, href: 'https://github.com/kamandprompt', label: 'GitHub' },
                { icon: Mail, href: 'mailto:webdevcell@iitmandi.ac.in', label: 'Email' },
              ].map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label} href={href} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.15, y: -2 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  aria-label={label}
                  className="w-10 h-10 glass rounded-xl flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  <Icon size={17} />
                </motion.a>
              ))}
            </div>
            <p className="text-slate-600 text-xs mt-4 font-mono">webdevcell@iitmandi.ac.in</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} Web Dev Cell · KamandPrompt · IIT Mandi</p>
          <p className="flex items-center gap-1">
            Built with <Heart size={11} className="text-red-500/70 mx-1" fill="currentColor" /> by Web Dev Cell
          </p>
        </div>
      </div>
    </footer>
  )
}
