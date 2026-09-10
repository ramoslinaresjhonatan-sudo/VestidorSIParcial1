const ACCESS_KEY = 'edu_access_token'
const REFRESH_KEY = 'edu_refresh_token'
const EMAIL_KEY = 'edu_user_email'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

export function setSession({ access, refresh, email }) {
  if (access) localStorage.setItem(ACCESS_KEY, access)
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
  if (email) localStorage.setItem(EMAIL_KEY, email)
}

export function clearSession() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(EMAIL_KEY)
}

export function decodeAccessToken() {
  const token = getAccessToken()
  if (!token) return null

  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')
    const bytes = Uint8Array.from(atob(paddedPayload), (character) => character.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return null
  }
}

export function getStoredUser() {
  const token = decodeAccessToken()
  return {
    id: token?.user_id ?? null,
    email: localStorage.getItem(EMAIL_KEY) || '',
  }
}

export function isAuthenticated() {
  const token = decodeAccessToken()
  return Boolean(token?.exp && token.exp * 1000 > Date.now())
}
