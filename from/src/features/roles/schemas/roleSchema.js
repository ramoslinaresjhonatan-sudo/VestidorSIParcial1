import { z } from 'zod'

export const roleSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre del rol es obligatorio.'),
  permisos_ids: z.array(z.coerce.number()).default([]),
})
