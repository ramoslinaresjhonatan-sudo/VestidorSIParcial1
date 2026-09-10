import { z } from 'zod'

export const categoriaOptions = [
  'vestidos','blusas','faldas','pantalones','jeans','conjuntos','ropa_interior','abrigos','tops','otro'
]
export const tallaOptions = ['XS','S','M','L','XL','XXL','UNICA','32','34','36','38','40','42','44','46']

export const productSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es obligatorio.').max(150),
  categoria: z.enum(categoriaOptions, { errorMap: () => ({ message: 'Seleccione una categoría' }) }),
  descripcion: z.string().trim().max(500).optional().or(z.literal('')),
  detalle: z.string().trim().max(2000).optional().or(z.literal('')),
  color: z.string().trim().min(2, 'El color es obligatorio.').max(50),
  talla: z.enum(tallaOptions, { errorMap: () => ({ message: 'Seleccione una talla' }) }),
  precio_bs: z.coerce.number().min(1, 'El precio mínimo es 1 Bs.').max(100000),
  stock: z.coerce.number().int().min(0).default(0),
  activo: z.boolean().default(true),
  imagen: z.any().optional(),
})
