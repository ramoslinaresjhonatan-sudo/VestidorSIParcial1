export function isSuperAdministrator(user) {
  if (!user) return false
  if (user.es_superadministrador) return true

  return Boolean(user.roles?.some(
    (role) => role.nombre?.trim().toLowerCase() === 'super administrador',
  ))
}

function hasRole(user, name) {
  if (!user) return false
  const target = name.toLowerCase()
  return Boolean(user.roles?.some((r) => r.nombre?.trim().toLowerCase() === target))
}

export function getUserRole(user) {
  if (isSuperAdministrator(user)) return 'administrador'
  if (hasRole(user, 'administrador')) return 'administrador'
  if (hasRole(user, 'vendedor')) return 'vendedor'
  if (hasRole(user, 'cajero')) return 'cajero'
  // CU-16: vendedor identificado por sucursal asignada aunque no tenga grupo
  if (user?.sucursal) return 'vendedor'
  // por defecto cliente (usuario normal sin rol administrativo)
  return 'cliente'
}

export function isAdministrador(user) { return getUserRole(user) === 'administrador' }
export function isVendedor(user) { return getUserRole(user) === 'vendedor' }
export function isCajero(user) { return getUserRole(user) === 'cajero' }
export function isCliente(user) { return getUserRole(user) === 'cliente' }
export function canManageInventory(user) {
  const role = getUserRole(user)
  return role === 'administrador' || role === 'vendedor'
}
export function shouldShowMeasurements(user) {
  // solo cliente ve talla corporal y método de pago
  return isCliente(user)
}
export function shouldShowInventory(user) { return canManageInventory(user) }
