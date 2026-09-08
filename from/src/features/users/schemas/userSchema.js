import { z } from 'zod'

const baseFields = {
  nombre: z.string().trim().min(2, 'El nombre es obligatorio.'),
  apellido_paterno: z.string().trim().min(2, 'El apellido paterno es obligatorio.'),
  apellido_materno: z.string().trim().optional().default(''),
  correo: z.string().trim().email('Ingresa un correo válido.'),
  roles_ids: z.array(z.coerce.number()).default([]),
  activo: z.boolean().default(true),
}

export const createUserSchema = z.object({
  ...baseFields,
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
})

export const updateUserSchema = z.object({
  ...baseFields,
  password: z.string().refine((value) => !value || value.length >= 8, {
    message: 'La contraseña debe tener al menos 8 caracteres.',
  }),
})
