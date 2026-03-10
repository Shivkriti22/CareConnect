import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('careconnect-token')
    const storedUser = localStorage.getItem('careconnect-user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const register = async (name, email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      return { success: true, message: data.message }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      // Store token and user info
      localStorage.setItem('careconnect-token', data.token)
      localStorage.setItem('careconnect-user', JSON.stringify(data.user))

      setToken(data.token)
      setUser(data.user)

      return { success: true, user: data.user, token: data.token }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('careconnect-token')
    localStorage.removeItem('careconnect-user')
    setToken(null)
    setUser(null)
    navigate('/')
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
