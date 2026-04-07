export interface TeamMember {
  id: number
  name: string
  role: string
  bio: string
  github_url?: string
  linkedin_url?: string
  year: number
}

export const TEAM: TeamMember[] = [
  {
    id: 1,
    name: 'Aarav Sharma',
    role: 'President',
    bio: 'Full-stack wizard, open-source contributor, and React Three Fiber enthusiast.',
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com',
    year: 4,
  },
  {
    id: 2,
    name: 'Priya Mehta',
    role: 'Tech Lead',
    bio: 'FastAPI + PostgreSQL devotee. Loves systems design and distributed systems.',
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com',
    year: 3,
  },
  {
    id: 3,
    name: 'Rohan Nair',
    role: 'Backend Engineer',
    bio: 'PostgreSQL whisperer, Rust-curious, and obsessed with clean APIs.',
    github_url: 'https://github.com',
    year: 3,
  },
  {
    id: 4,
    name: 'Ananya Singh',
    role: 'Frontend Engineer',
    bio: 'Three.js + WebGL enthusiast. If it can\'t do 60fps, it doesn\'t ship.',
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com',
    year: 2,
  },
  {
    id: 5,
    name: 'Kabir Patel',
    role: 'DevOps',
    bio: 'Docker, Kubernetes, Azure — cloud-native everything. Zero downtime or bust.',
    github_url: 'https://github.com',
    year: 4,
  },
  {
    id: 6,
    name: 'Diya Krishnan',
    role: 'UI/UX Designer',
    bio: 'Figma power user and motion design aficionado. Makes engineers cry (in a good way).',
    linkedin_url: 'https://linkedin.com',
    year: 2,
  },
]
