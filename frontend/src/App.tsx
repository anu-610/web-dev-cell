import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from '@/components/ui/NavBar'
import Home from '@/pages/Home'
import Posts from '@/pages/Posts'
import PostDetail from '@/pages/PostDetail'
import WritePost from '@/pages/WritePost'
import Announcements from '@/pages/Announcements'
import Login from '@/pages/admin/Login'
import Dashboard from '@/pages/admin/Dashboard'
import ThemeSwitcher from '@/components/hero/ThemeSwitcher'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/themeStore'
import AnnouncementPopup from '@/components/ui/AnnouncementPopup'
import CustomCursor from '@/components/ui/CustomCursor'

function PublicLayout() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/posts/new" element={<WritePost />} />
        <Route path="/posts/edit/:id" element={<WritePost />} />
        <Route path="/announcements" element={<Announcements />} />
      </Routes>
      <ThemeSwitcher />
    </>
  )
}

function AdminLayout() {
  return (
    <>
      <NavBar />
      <div className="pt-16 min-h-screen flex flex-col bg-void-950">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </div>
    </>
  )
}

function AppInner() {
  const { checkSession } = useAuthStore()
  const { fetchTheme } = useThemeStore()

  useEffect(() => {
    checkSession()
    fetchTheme() // pull the DB-authoritative theme on every page load
  }, [checkSession, fetchTheme])

  useEffect(() => {
    // Supabase sometimes strips the route on OAuth callbacks and dumps the user on the root '/'
    // If we detect an error or a successful access_token on the homepage, forward them to the posts page 
    if (window.location.pathname === '/') {
      const searchStr = window.location.search
      const hashStr = window.location.hash
      
      const hasError = searchStr.includes('error=') || hashStr.includes('error=')
      const hasToken = hashStr.includes('access_token=')
      
      if (hasError || hasToken) {
        window.location.href = `/posts/new${searchStr}${hashStr}`
      }
    }
  }, [])

  return (
    <>
      <CustomCursor />
      <AnnouncementPopup />
      <Routes>
        <Route path="/*" element={<PublicLayout />} />
        <Route path="/admin/*" element={<AdminLayout />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}
