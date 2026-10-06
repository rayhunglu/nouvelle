import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from './api'

// user: undefined = still checking, null = signed out, object = signed in
const AuthContext = createContext({ user: null, login: async () => {}, logout: async () => {} })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    api('/auth/me').then((d) => setUser(d.user)).catch(() => setUser(null))
    const expired = () => setUser(null)
    window.addEventListener('auth:expired', expired)
    return () => window.removeEventListener('auth:expired', expired)
  }, [])

  const login = useCallback(async (username, password) => {
    const d = await api('/auth/login', { method: 'POST', body: { username, password } })
    setUser(d.user)
  }, [])

  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST', body: {} }).catch(() => {})
    setUser(null)
  }, [])

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
