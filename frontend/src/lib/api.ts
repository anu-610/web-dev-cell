import { useAuthStore } from '@/stores/auth'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

interface FetchOptions extends RequestInit {
  data?: any
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { data, headers: customHeaders, ...rest } = options
  const token = useAuthStore.getState().token

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string> || {})
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = `${API_BASE}${endpoint}`

  const response = await fetch(url, {
    ...rest,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `API Error: ${response.statusText}`)
  }

  // Handle 204 No Content
  if (response.status === 204) return {} as T

  return response.json()
}
