const KEY = 'inventory_pending_queue'

export function getQueue() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
export function pushQueue(item) {
  const q = getQueue()
  q.push({ ...item, _ts: Date.now(), _id: Math.random().toString(36).slice(2) })
  localStorage.setItem(KEY, JSON.stringify(q))
}
export function clearQueue() { localStorage.removeItem(KEY) }
export function removeFromQueue(id) {
  const q = getQueue().filter((i) => i._id !== id)
  localStorage.setItem(KEY, JSON.stringify(q))
}
export function hasPending() { return getQueue().length > 0 }
