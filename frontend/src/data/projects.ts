export interface Project {
  id: number
  title: string
  description: string
  image_url?: string
  github_url?: string
  live_url?: string
  tags: string[]
  featured: boolean
}

export const PROJECTS: Project[] = [
  {
    id: 1,
    title: 'KamandPrompt Portal',
    description:
      'The official competitive programming portal for IIT Mandi with real-time leaderboards, problem sets, and live contest infrastructure.',
    github_url: 'https://github.com/kamandprompt',
    tags: ['React', 'FastAPI', 'PostgreSQL', 'WebSockets'],
    featured: true,
  },
  {
    id: 2,
    title: 'Spectrum CTF Platform',
    description:
      'A full-featured Capture-the-Flag platform supporting Jeopardy and Attack-Defense formats, built for Spectrum — IIT Mandi\'s annual security fest.',
    github_url: 'https://github.com/kamandprompt',
    tags: ['Python', 'Docker', 'Redis', 'Next.js'],
    featured: true,
  },
  {
    id: 3,
    title: 'Placement Statistics Dashboard',
    description:
      'Interactive data-visualisation dashboard for IIT Mandi placement data with filterable charts and historical trend analysis.',
    github_url: 'https://github.com/kamandprompt',
    tags: ['React', 'D3.js', 'Express'],
    featured: false,
  },
  {
    id: 4,
    title: 'Dev Cell Blog Engine',
    description:
      'A lightweight, MDX-powered technical blog platform with syntax highlighting and reading-time estimates.',
    github_url: 'https://github.com/kamandprompt',
    tags: ['Next.js', 'MDX', 'Tailwind CSS'],
    featured: false,
  },
]
