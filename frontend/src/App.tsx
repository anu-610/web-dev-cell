import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from '@/components/ui/NavBar'
import Home from '@/pages/Home'
import Login from '@/pages/admin/Login'
import Dashboard from '@/pages/admin/Dashboard'

function PublicLayout() {
  return (
    <>
      <NavBar />
      <Home />
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
