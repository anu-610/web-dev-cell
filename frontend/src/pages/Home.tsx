import Hero from '@/components/sections/Hero'
import Projects from '@/components/sections/Projects'
import Team from '@/components/sections/Team'
import Footer from '@/components/sections/Footer'

export default function Home() {
  return (
    <main className="w-full overflow-x-hidden">
      <Hero />
      <Projects />
      <Team />
      <Footer />
    </main>
  )
}
