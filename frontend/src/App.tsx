import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from '@/components/ui/NavBar'
import Home from '@/pages/Home'
import Login from '@/pages/admin/Login'
import Dashboard from '@/pages/admin/Dashboard'
import ThemeSwitcher from '@/components/hero/ThemeSwitcher'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/themeStore'

function PublicLayout() {
  return (
    <>
      <NavBar />
      <Home />
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
      <Route path="/" element={<PublicLayout />} />
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
