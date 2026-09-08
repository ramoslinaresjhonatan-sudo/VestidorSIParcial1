export function isSuperAdministrator(user) {
  if (!user) return false
  if (user.es_superadministrador) return true

  return Boolean(user.roles?.some(
    (role) => role.nombre?.trim().toLowerCase() === 'super administrador',
  ))
}
