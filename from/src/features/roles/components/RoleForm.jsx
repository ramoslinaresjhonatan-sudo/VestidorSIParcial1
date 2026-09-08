import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/Button/Button'
import { roleSchema } from '../schemas/roleSchema'

export function RoleForm({ role, permissions = [], onSubmit, onCancel, loading, serverError }) {
  const [search, setSearch] = useState('')
  const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(roleSchema),
    defaultValues: { nombre: role?.nombre || '', permisos_ids: role?.permisos?.map((item) => item.id) || [] },
  })

  useEffect(() => reset({ nombre: role?.nombre || '', permisos_ids: role?.permisos?.map((item) => item.id) || [] }), [reset, role])
  const selected = useWatch({ control, name: 'permisos_ids' }) || []
  const grouped = useMemo(() => {
    const term = search.toLowerCase().trim()
    const filtered = permissions.filter((item) => `${item.nombre} ${item.codigo} ${item.modulo}`.toLowerCase().includes(term))
    return filtered.reduce((groups, item) => ({ ...groups, [item.modulo]: [...(groups[item.modulo] || []), item] }), {})
  }, [permissions, search])

  const toggle = (id) => setValue('permisos_ids', selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id], { shouldDirty: true })
  const toggleModule = (items) => {
    const ids = items.map((item) => item.id)
    const allSelected = ids.every((id) => selected.includes(id))
    setValue('permisos_ids', allSelected ? selected.filter((id) => !ids.includes(id)) : [...new Set([...selected, ...ids])], { shouldDirty: true })
  }

  return (
    <form className="management-form" onSubmit={handleSubmit(onSubmit)}>
      {serverError && <div className="form-alert form-alert--danger">{serverError}</div>}
      <label className="plain-field">Nombre del rol<span>*</span><input {...register('nombre')} placeholder="Ej. Secretaría" />{errors.nombre && <small>{errors.nombre.message}</small>}</label>
      <fieldset className="permission-fieldset">
        <legend>Permisos del rol</legend>
        <div className="permission-toolbar"><div className="table-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar permisos..." /></div><span>{selected.length} seleccionados</span></div>
        <div className="permission-groups">
          {Object.entries(grouped).map(([module, items]) => (
            <section key={module}>
              <header><div><strong>{module}</strong><small>{items.length} permisos</small></div><button type="button" onClick={() => toggleModule(items)}>{items.every((item) => selected.includes(item.id)) ? 'Quitar todos' : 'Seleccionar todos'}</button></header>
              <div>{items.map((permission) => <label key={permission.id} className="permission-check"><input type="checkbox" checked={selected.includes(permission.id)} onChange={() => toggle(permission.id)} /><span><strong>{permission.nombre}</strong><small>{permission.codigo}</small></span></label>)}</div>
            </section>
          ))}
          {!Object.keys(grouped).length && <span className="form-empty-note">No se encontraron permisos.</span>}
        </div>
      </fieldset>
      <div className="form-actions"><Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button><Button type="submit" loading={loading}>{role ? 'Guardar cambios' : 'Crear rol'}</Button></div>
    </form>
  )
}
