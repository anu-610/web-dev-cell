import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from '@/components/ui/NavBar'
import Home from '@/pages/Home'
import Login from '@/pages/admin/Login'
import Dashboard from '@/pages/admin/Dashboard'
import ThemeSwitcher from '@/components/hero/ThemeSwitcher'

function PublicLayout() {
  return (
    <>
      <NavBar />
      <Home />
      <ThemeSwitcher />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLayout />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
