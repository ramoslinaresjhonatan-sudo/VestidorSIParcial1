import { z } from 'zod'

export const planSchema = z.object({
  code: z.string()
    .trim()
    .min(2, 'El código es obligatorio.')
    .max(40, 'El código admite hasta 40 caracteres.')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Usa minúsculas, números y guiones.'),
  name: z.string().trim().min(2, 'El nombre es obligatorio.').max(100),
  description: z.string().trim().max(280, 'La descripción admite hasta 280 caracteres.'),
  price: z.coerce.number().min(1, 'El precio debe ser mayor o igual a 1.'),
  currency: z.enum(['bob', 'usd']),
  duration_days: z.coerce.number().int().min(1, 'La duración mínima es un día.'),
  student_limit: z.coerce.number().int().min(1, 'El límite mínimo es un estudiante.'),
  modules: z.array(z.string()).min(1, 'Selecciona al menos un módulo.'),
  featured: z.boolean(),
  active: z.boolean(),
  order: z.coerce.number().int().min(0, 'El orden no puede ser negativo.'),
})
