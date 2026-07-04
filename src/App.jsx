import React, { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { LayoutDashboard, Users, Calendar, UploadCloud } from 'lucide-react'

// Auth Context
const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

const Sidebar = () => {
  const { user, logout } = useAuth()
  const isAdmin = user?.role === 'Admin'
  const isStudent = user?.role === 'Student'

  return (
    <aside className="sidebar glass">
      <div className="sidebar-logo">Academy Pro</div>
      <nav className="nav-links">
        {isAdmin && (
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
        )}
        {isAdmin && (
          <NavLink to="/players" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            Players
          </NavLink>
        )}
        <NavLink to="/classes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Calendar size={20} />
          Classes
        </NavLink>
        {isAdmin && (
          <NavLink to="/coaches" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            Coaches
          </NavLink>
        )}
        {isAdmin && (
          <NavLink to="/import" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <UploadCloud size={20} />
            Import Data
          </NavLink>
        )}
        {isStudent && user?.player_id && (
          <NavLink to={`/players/${user.player_id}`} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            My Profile
          </NavLink>
        )}
        <button onClick={logout} className="nav-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', marginTop: 'auto' }}>
          Logout
        </button>
      </nav>
    </aside>
  )
}

const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  return (
    <div className="app-container">
      <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        ☰ Menu
      </button>
      <div className={`sidebar-wrapper ${mobileMenuOpen ? 'open' : ''}`}>
        <Sidebar />
      </div>
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
// Placeholder Pages (we will implement these next)
import Dashboard from './pages/Dashboard'
import Players from './pages/Players'
import Classes from './pages/Classes'
import ImportData from './pages/ImportData'

import PlayerProfile from './pages/PlayerProfile'
import EditProfile from './pages/EditProfile'
import Coaches from './pages/Coaches'
import ClassDetails from './pages/ClassDetails'

import Login from './pages/Login'

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />
  return <Layout>{children}</Layout>
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser(payload)
      } catch (e) {
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const handleLogin = (token) => {
    const payload = JSON.parse(atob(token.split('.')[1]))
    setUser(payload)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  if (loading) return <div>Loading...</div>

  return (
    <AuthContext.Provider value={{ user, logout: handleLogout }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          
          <Route path="/" element={<PrivateRoute allowedRoles={['Admin', 'Student']}><Dashboard /></PrivateRoute>} />
          <Route path="/players" element={<PrivateRoute allowedRoles={['Admin']}><Players /></PrivateRoute>} />
          <Route path="/players/:id" element={<PrivateRoute allowedRoles={['Admin', 'Student']}><PlayerProfile /></PrivateRoute>} />
          <Route path="/players/:id/edit" element={<PrivateRoute allowedRoles={['Admin', 'Student']}><EditProfile /></PrivateRoute>} />
          <Route path="/classes" element={<PrivateRoute allowedRoles={['Admin', 'Student']}><Classes /></PrivateRoute>} />
          <Route path="/classes/:id" element={<PrivateRoute allowedRoles={['Admin', 'Student']}><ClassDetails /></PrivateRoute>} />
          <Route path="/coaches" element={<PrivateRoute allowedRoles={['Admin']}><Coaches /></PrivateRoute>} />
          <Route path="/import" element={<PrivateRoute allowedRoles={['Admin']}><ImportData /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

export default App
