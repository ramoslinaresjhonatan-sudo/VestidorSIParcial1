import { z } from 'zod'

export const profileSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es obligatorio.'),
  apellido_paterno: z.string().trim().min(2, 'El apellido paterno es obligatorio.'),
  apellido_materno: z.string().trim().optional().default(''),
  correo: z.string().trim().email('Ingresa un correo válido.'),
  telefono: z.string().trim().max(20, 'Máximo 20 caracteres.').optional().default(''),
  direccion: z.string().trim().max(255).optional().default(''),
  direccion_envio: z.string().trim().max(255).optional().default(''),
  metodo_pago_preferido: z.enum(['tarjeta', 'paypal', 'transferencia', 'efectivo', '']).optional().default(''),
  medida_pecho: z.coerce.number().min(20).max(200).optional().nullable().or(z.literal('')),
  medida_cintura: z.coerce.number().min(20).max(200).optional().nullable().or(z.literal('')),
  medida_cadera: z.coerce.number().min(20).max(200).optional().nullable().or(z.literal('')),
  altura: z.coerce.number().min(0.5).max(2.5).optional().nullable().or(z.literal('')),
  peso: z.coerce.number().min(20).max(300).optional().nullable().or(z.literal('')),
})

export function suggestSize(pecho, cintura) {
  const ref = pecho ? Number(pecho) : cintura ? Number(cintura) : null
  if (!ref || Number.isNaN(ref)) return ''
  if (ref < 86) return 'XS'
  if (ref < 92) return 'S'
  if (ref < 98) return 'M'
  if (ref < 104) return 'L'
  if (ref < 110) return 'XL'
  return 'XXL'
}
