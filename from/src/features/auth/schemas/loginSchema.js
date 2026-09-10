import { z } from 'zod'

export const loginSchema = z.object({
  correo: z.string().trim().email('Ingresa un correo válido.'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
})
