/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo } from 'react'

const AuthContext = createContext(null)

function getInitialAuth() {
  const storedToken = localStorage.getItem('pharmafind_token')
  const storedUser = localStorage.getItem('pharmafind_user')
  
  if (storedToken && storedUser) {
    try {
      return {
        token: storedToken,
        user: JSON.parse(storedUser),
      }
    } catch (err) {
      console.error('Failed to parse stored user:', err)
      localStorage.removeItem('pharmafind_token')
      localStorage.removeItem('pharmafind_user')
    }
  }
  
  return { token: null, user: null }
}

export function AuthProvider({ children }) {
  const initialAuth = useMemo(() => getInitialAuth(), [])
  const [user, setUser] = useState(initialAuth.user)
  const [token, setToken] = useState(initialAuth.token)
  const [loading] = useState(false)

  const login = (authToken, userData) => {
    setToken(authToken)
    setUser(userData)
    localStorage.setItem('pharmafind_token', authToken)
    localStorage.setItem('pharmafind_user', JSON.stringify(userData))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('pharmafind_token')
    localStorage.removeItem('pharmafind_user')
  }

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    isPharmacy: user?.role === 'pharmacy',
    isConsumer: user?.role === 'consumer',
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
