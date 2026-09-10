import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button/Button'
import { categoriaOptions, productSchema, tallaOptions } from '../schemas/catalogSchema'

function defaults(product) {
  return {
    nombre: product?.nombre || '',
    categoria: product?.categoria || 'vestidos',
    descripcion: product?.descripcion || '',
    detalle: product?.detalle || '',
    color: product?.color || '',
    talla: product?.talla || 'M',
    precio_bs: product ? product.precio_centavos / 100 : 10,
    stock: product?.stock ?? 0,
    activo: product?.activo ?? true,
  }
}

export function CatalogForm({ product, onSubmit, onCancel, loading, serverError }) {
  const editing = Boolean(product)
  const [preview, setPreview] = useState(product?.imagen_url || product?.imagen || null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: defaults(product),
  })

  useEffect(() => {
    reset(defaults(product))
    setPreview(product?.imagen_url || product?.imagen || null)
  }, [product, reset])

  const submit = (values) => {
    const fd = new FormData()
    fd.append('nombre', values.nombre)
    fd.append('categoria', values.categoria)
    fd.append('descripcion', values.descripcion || '')
    fd.append('detalle', values.detalle || '')
    fd.append('color', values.color)
    fd.append('talla', values.talla)
    fd.append('precio_centavos', String(Math.round(values.precio_bs * 100)))
    fd.append('stock', String(values.stock))
    fd.append('activo', values.activo ? 'true' : 'false')
    if (values.imagen && values.imagen[0] instanceof File) {
      fd.append('imagen', values.imagen[0])
    }
    onSubmit(fd)
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  return (
    <form className="management-form catalog-form" onSubmit={handleSubmit(submit)}>
      {serverError && <div className="form-alert form-alert--danger">{serverError}</div>}

      <div className="form-grid form-grid--two">
        <label className="plain-field">Nombre producto<span>*</span><input {...register('nombre')} placeholder="Ej. Vestido Floral" />{errors.nombre && <small>{errors.nombre.message}</small>}</label>
        <label className="plain-field">Categoría<span>*</span>
          <select {...register('categoria')}>
            {categoriaOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>{errors.categoria && <small>{errors.categoria.message}</small>}
        </label>
        <label className="plain-field">Color<span>*</span><input {...register('color')} placeholder="Ej. Rojo, Negro" />{errors.color && <small>{errors.color.message}</small>}</label>
        <label className="plain-field">Talla exacta<span>*</span>
          <select {...register('talla')}>
            {tallaOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>{errors.talla && <small>{errors.talla.message}</small>}
        </label>
        <label className="plain-field">Precio (Bs)<span>*</span><input type="number" min="1" step="0.01" {...register('precio_bs')} />{errors.precio_bs && <small>{errors.precio_bs.message}</small>}</label>
        <label className="plain-field">Stock<span>*</span><input type="number" min="0" {...register('stock')} />{errors.stock && <small>{errors.stock.message}</small>}</label>
      </div>

      <label className="plain-field">Descripción<textarea rows="2" {...register('descripcion')} placeholder="Descripción corta" />{errors.descripcion && <small>{errors.descripcion.message}</small>}</label>
      <label className="plain-field">Detalle / Materiales<textarea rows="3" {...register('detalle')} placeholder="Detalle largo, materiales, cuidados..." />{errors.detalle && <small>{errors.detalle.message}</small>}</label>

      <div className="form-grid form-grid--two">
        <label className="plain-field">Imagen (archivo)
          {(() => {
            const imgReg = register('imagen')
            return <input type="file" accept="image/*" {...imgReg} onChange={(e)=>{ imgReg.onChange(e); handleImageChange(e) }} />
          })()}
          {preview && <img src={preview} alt="preview" style={{marginTop:8, width:120, height:120, objectFit:'cover', borderRadius:8, border:'1px solid #e5e7eb'}} />}
        </label>
        <label className="status-switch"><input type="checkbox" {...register('activo')} /><span /><div><strong>Producto activo</strong><small>Visible en catálogo público.</small></div></label>
      </div>

      <div className="form-actions"><Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button><Button type="submit" loading={loading}>{editing ? 'Guardar cambios' : 'Crear producto'}</Button></div>
    </form>
  )
}
