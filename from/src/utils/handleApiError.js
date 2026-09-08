export function handleApiError(error) {
  if (!error?.response) return 'No se pudo conectar con el servidor.'

  const apiMessage = error.response.data?.message
  if (apiMessage) return apiMessage

  const errors = error.response.data?.errors
  if (errors && typeof errors === 'object') {
    const firstError = Object.values(errors).flat()[0]
    if (firstError) return String(firstError)
  }

  const messages = {
    400: 'Revisa los datos ingresados.',
    401: 'La sesión ha expirado.',
    403: 'No tienes permisos para realizar esta acción.',
    404: 'El registro solicitado no existe.',
    409: 'La operación entra en conflicto con el estado actual.',
  }

  return messages[error.response.status] || 'Ocurrió un error inesperado.'
}
