import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from './api'

// user: undefined = still checking, null = signed out, object = signed in
const AuthContext = createContext({ user: null, can: () => false, login: async () => {}, logout: async () => {} })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    api('/auth/me').then((d) => setUser(d.user)).catch(() => setUser(null))
    const expired = () => setUser(null)
    // An operator's permissions can be changed by the manager while they are signed in: pick them up when the tab is focused again.
    const refresh = () => api('/auth/me').then((d) => setUser((cur) => (cur && JSON.stringify(cur) !== JSON.stringify(d.user) ? d.user : cur))).catch(() => {})
    window.addEventListener('auth:expired', expired)
    window.addEventListener('focus', refresh)
    return () => { window.removeEventListener('auth:expired', expired); window.removeEventListener('focus', refresh) }
  }, [])

  const login = useCallback(async (username, password) => {
    const d = await api('/auth/login', { method: 'POST', body: { username, password } })
    setUser(d.user)
  }, [])

  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST', body: {} }).catch(() => {})
    setUser(null)
  }, [])

  // The store manager can do everything; an operator only what the manager ticked for their account.
  const can = useCallback((key) => user?.role === 'admin' || !!user?.permissions?.[key], [user])

  return <AuthContext.Provider value={{ user, can, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
