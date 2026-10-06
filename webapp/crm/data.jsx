import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api'

const CrmContext = createContext(null)

// Loads all CRM collections once and exposes reload + simple CRUD helpers.
export function CrmProvider({ children }) {
  const [state, setState] = useState({ customers: [], appointments: [], payments: [], services: [], ready: false })

  const reload = useCallback(async () => {
    const [customers, appointments, payments, services] = await Promise.all([
      api('/crm/customers'), api('/crm/appointments'), api('/crm/payments'), api('/crm/services'),
    ])
    setState({ customers, appointments, payments, services, ready: true })
  }, [])

  useEffect(() => { reload().catch(() => {}) }, [reload])

  const save = useCallback(async (kind, id, body) => {
    const row = await api(id ? `/crm/${kind}/${id}` : `/crm/${kind}`, { method: id ? 'PUT' : 'POST', body })
    await reload()
    return row
  }, [reload])

  const remove = useCallback(async (kind, id) => {
    await api(`/crm/${kind}/${id}`, { method: 'DELETE' })
    await reload()
  }, [reload])

  const customerById = useMemo(() => Object.fromEntries(state.customers.map((c) => [c.id, c])), [state.customers])
  const serviceById = useMemo(() => Object.fromEntries(state.services.map((x) => [x.id, x])), [state.services])

  return <CrmContext.Provider value={{ ...state, customerById, serviceById, reload, save, remove }}>{children}</CrmContext.Provider>
}

export const useCrm = () => useContext(CrmContext)
