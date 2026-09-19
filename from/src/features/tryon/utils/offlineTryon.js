const KEY = 'tryon_pending'

export function pushPending(item) {
  const q = JSON.parse(localStorage.getItem(KEY) || '[]')
  q.push({ ...item, _ts: Date.now() })
  localStorage.setItem(KEY, JSON.stringify(q))
}
export function getPending() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
export function clearPending() { localStorage.removeItem(KEY) }
