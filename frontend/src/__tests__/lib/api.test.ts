import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock window.location
const locationMock = { href: '' }
Object.defineProperty(window, 'location', {
  value: locationMock,
  writable: true,
})

// Mock fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Import AFTER mocks are set up
import { api } from '@/lib/api'

describe('ApiClient', () => {
  beforeEach(() => {
    localStorageMock.clear()
    mockFetch.mockReset()
    locationMock.href = ''
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('makes GET requests to the correct URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: 'test' }),
    })

    const result = await api.get('/api/health')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/health',
      expect.objectContaining({ method: 'GET' })
    )
    expect(result).toEqual({ data: 'test' })
  })

  it('attaches Authorization header when token exists in localStorage', async () => {
    localStorageMock.setItem('token', 'my-jwt-token')

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ proposals: [] }),
    })

    await api.get('/api/proposals')

    const callArgs = mockFetch.mock.calls[0]
    const headers = callArgs[1].headers
    expect(headers['Authorization']).toBe('Bearer my-jwt-token')
  })

  it('does not attach Authorization header when no token', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    })

    await api.get('/api/health')

    const callArgs = mockFetch.mock.calls[0]
    const headers = callArgs[1].headers
    expect(headers['Authorization']).toBeUndefined()
  })

  it('sends JSON body on POST requests', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: '1' }),
    })

    await api.post('/api/proposals', { client_name: 'Acme' })

    const callArgs = mockFetch.mock.calls[0]
    expect(callArgs[1].method).toBe('POST')
    expect(callArgs[1].body).toBe(JSON.stringify({ client_name: 'Acme' }))
    expect(callArgs[1].headers['Content-Type']).toBe('application/json')
  })

  it('sends JSON body on PUT requests', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: '1' }),
    })

    await api.put('/api/proposals/1', { client_name: 'Updated' })

    const callArgs = mockFetch.mock.calls[0]
    expect(callArgs[1].method).toBe('PUT')
  })

  it('sends JSON body on PATCH requests', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ status: 'sent' }),
    })

    await api.patch('/api/proposals/1/status', { status: 'sent' })

    const callArgs = mockFetch.mock.calls[0]
    expect(callArgs[1].method).toBe('PATCH')
  })

  it('sends DELETE requests', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ message: 'Deleted' }),
    })

    await api.delete('/api/proposals/1')

    const callArgs = mockFetch.mock.calls[0]
    expect(callArgs[1].method).toBe('DELETE')
  })

  it('clears auth and redirects to /login on 401 response', async () => {
    localStorageMock.setItem('token', 'expired-token')
    localStorageMock.setItem('user', '{"id":"1"}')

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' }),
    })

    await expect(api.get('/api/proposals')).rejects.toThrow()

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
    expect(locationMock.href).toBe('/login')
  })

  it('throws error with status for non-401 error responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Not found' }),
    })

    try {
      await api.get('/api/proposals/nonexistent')
      expect.fail('Should have thrown')
    } catch (err: unknown) {
      const error = err as Error & { status: number }
      expect(error.message).toBe('Not found')
      expect(error.status).toBe(404)
    }
  })

  it('handles non-JSON error responses gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => { throw new Error('not json') },
    })

    await expect(api.get('/api/fail')).rejects.toThrow()
  })
})
