const STORAGE_KEY = 'profile_pending_sync'
const PENDING_FLAG = 'profile_offline_pending'

export function savePendingProfile(payload) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ payload, timestamp: Date.now() }))
  localStorage.setItem(PENDING_FLAG, 'true')
}

export function getPendingProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearPendingProfile() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(PENDING_FLAG)
}

export function hasPendingProfile() {
  return localStorage.getItem(PENDING_FLAG) === 'true'
}

export function isOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}
