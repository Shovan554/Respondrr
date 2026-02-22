import { supabase } from './supabase'
import {
  buildMockTrends,
  mockActiveCases,
  mockDashboardSummary,
  mockDispatchAlert,
  mockRecentDoctors,
  mockRecentPatients,
  mockVitals
} from './mockData'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

const normalizeOptions = (options: RequestInit = {}) => {
  const headers = new Headers(options.headers ?? {})
  let body = options.body

  if (body && typeof body !== 'string') {
    body = JSON.stringify(body)
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
  }

  return { ...options, headers, body }
}

const safeJson = async <T>(response: Response): Promise<T> => {
  const text = await response.text()
  return text ? (JSON.parse(text) as T) : ({} as T)
}

const apiRequest = async <T>(
  path: string,
  options: RequestInit = {},
  fallback?: T
): Promise<T> => {
  if (USE_MOCKS && fallback !== undefined) return fallback

  try {
    const normalized = normalizeOptions(options)
    const response = await fetch(`${API_BASE_URL}${path}`, normalized)

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }

    return await safeJson<T>(response)
  } catch (error) {
    if (fallback !== undefined) return fallback
    throw error
  }
}

const authedRequest = async <T>(
  path: string,
  options: RequestInit = {},
  fallback?: T
): Promise<T> => {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    if (fallback !== undefined) return fallback
    throw new Error('No active session')
  }

  const normalized = normalizeOptions(options)
  const headers = new Headers(normalized.headers ?? {})
  headers.set('Authorization', `Bearer ${session.access_token}`)

  return apiRequest<T>(path, { ...normalized, headers }, fallback)
}

export const getDashboardSummary = () =>
  authedRequest('/api/dashboard/summary', {}, mockDashboardSummary)

export const getVitals = () =>
  authedRequest('/api/dashboard/vitals', {}, mockVitals)

export const getTrends = (metric: string, days: number) =>
  authedRequest(`/api/dashboard/trends?metric=${metric}&days=${days}`, {}, buildMockTrends(metric, days))

export const getActiveCases = () =>
  authedRequest('/api/respondr/active-cases', {}, mockActiveCases)

export const getDispatchAlert = () =>
  authedRequest('/api/respondr/dispatch', {}, mockDispatchAlert)

export const getRecentDoctors = () =>
  authedRequest('/api/patient/recent-doctors', {}, mockRecentDoctors)

export const getRecentPatients = () =>
  authedRequest('/api/respondr/recent-patients', {}, mockRecentPatients)

export const sendEmergencyPing = (payload: Record<string, unknown>) =>
  authedRequest('/api/emergency', { method: 'POST', body: payload }, { ok: true, request_id: 'TEMP-EMERGENCY' })
