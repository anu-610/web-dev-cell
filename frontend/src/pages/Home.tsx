import Hero from '@/components/sections/Hero'
import Projects from '@/components/sections/Projects'
import Team from '@/components/sections/Team'
import Footer from '@/components/sections/Footer'
import GitHubStats from '@/components/sections/GitHubStats'

export default function Home() {
  return (
    <main className="w-full overflow-x-hidden">
      <Hero />
      <Projects />
      <GitHubStats />
      <Team />
      <Footer />
    </main>
  )
}
