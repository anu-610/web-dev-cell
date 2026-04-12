import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from '@/components/ui/NavBar'
import Home from '@/pages/Home'
import Posts from '@/pages/Posts'
import PostDetail from '@/pages/PostDetail'
import WritePost from '@/pages/WritePost'
import Login from '@/pages/admin/Login'
import Dashboard from '@/pages/admin/Dashboard'
import ThemeSwitcher from '@/components/hero/ThemeSwitcher'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/themeStore'

function PublicLayout() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/posts/new" element={<WritePost />} />
      </Routes>
      <ThemeSwitcher />
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

  return (
    <Routes>
      <Route path="/*" element={<PublicLayout />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<Dashboard />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}
