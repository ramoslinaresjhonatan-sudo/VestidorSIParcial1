import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/Button/Button'
import { createUserSchema, updateUserSchema } from '../schemas/userSchema'

function defaults(user) {
  return {
    nombre: user?.nombre || '',
    apellido_paterno: user?.apellido_paterno || '',
    apellido_materno: user?.apellido_materno || '',
    correo: user?.correo || '',
    password: '',
    roles_ids: user?.roles?.map((role) => role.id) || [],
    activo: user?.activo ?? true,
  }
}

export function UserForm({ user, roles = [], onSubmit, onCancel, loading, serverError }) {
  const editing = Boolean(user)
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editing ? updateUserSchema : createUserSchema),
    defaultValues: defaults(user),
  })

  useEffect(() => reset(defaults(user)), [reset, user])
  const selectedRoles = useWatch({ control, name: 'roles_ids' }) || []

  const toggleRole = (roleId) => {
    const next = selectedRoles.includes(roleId)
      ? selectedRoles.filter((id) => id !== roleId)
      : [...selectedRoles, roleId]
    setValue('roles_ids', next, { shouldDirty: true, shouldValidate: true })
  }

  const submit = (values) => {
    const payload = { ...values, apellido_materno: values.apellido_materno || '' }
    if (editing && !payload.password) delete payload.password
    onSubmit(payload)
  }

  return (
    <form className="management-form" onSubmit={handleSubmit(submit)}>
      {serverError && <div className="form-alert form-alert--danger">{serverError}</div>}
      <div className="form-grid form-grid--two">
        <label className="plain-field">Nombre<span>*</span><input {...register('nombre')} placeholder="Ej. María" />{errors.nombre && <small>{errors.nombre.message}</small>}</label>
        <label className="plain-field">Apellido paterno<span>*</span><input {...register('apellido_paterno')} placeholder="Ej. Flores" />{errors.apellido_paterno && <small>{errors.apellido_paterno.message}</small>}</label>
        <label className="plain-field">Apellido materno<input {...register('apellido_materno')} placeholder="Ej. Vargas" />{errors.apellido_materno && <small>{errors.apellido_materno.message}</small>}</label>
        <label className="plain-field">Correo institucional<span>*</span><input type="email" {...register('correo')} placeholder="usuario@institucion.edu" />{errors.correo && <small>{errors.correo.message}</small>}</label>
      </div>
      <label className="plain-field">{editing ? 'Nueva contraseña (opcional)' : 'Contraseña temporal'}<span>*</span><input type="password" autoComplete="new-password" {...register('password')} placeholder={editing ? 'Dejar vacío para conservar' : 'Mínimo 8 caracteres'} />{errors.password && <small>{errors.password.message}</small>}</label>

      <fieldset className="choice-fieldset">
        <legend>Roles asignados</legend>
        <p>Selecciona los perfiles de acceso que tendrá este usuario.</p>
        <div className="role-choice-grid">
          {roles.length ? roles.map((role) => {
            const selected = selectedRoles.includes(role.id)
            return (
              <button key={role.id} className={selected ? 'selected' : ''} type="button" onClick={() => toggleRole(role.id)}>
                <i>{selected ? '✓' : ''}</i><span><strong>{role.nombre}</strong><small>{role.permisos?.length || 0} permisos</small></span>
              </button>
            )
          }) : <span className="form-empty-note">No hay roles disponibles.</span>}
        </div>
      </fieldset>

      {editing && <label className="status-switch"><input type="checkbox" {...register('activo')} /><span /><div><strong>Usuario activo</strong><small>Permite iniciar sesión y operar en el sistema.</small></div></label>}

      <div className="form-actions"><Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button><Button type="submit" loading={loading}>{editing ? 'Guardar cambios' : 'Crear usuario'}</Button></div>
    </form>
  )
}
