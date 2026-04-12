import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from '@/components/ui/NavBar'
import Home from '@/pages/Home'
import Login from '@/pages/admin/Login'
import Dashboard from '@/pages/admin/Dashboard'
import ThemeSwitcher from '@/components/hero/ThemeSwitcher'
import { useAuthStore } from '@/stores/auth'

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

  // Check for existing Supabase session on every page load
  // so isAdmin is correctly set on the public home page too
  useEffect(() => {
    checkSession()
  }, [checkSession])

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
