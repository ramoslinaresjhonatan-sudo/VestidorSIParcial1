import { LoaderCircle } from 'lucide-react'
import './Button.css'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) {
  return (
    <button
      className={`ui-button ui-button--${variant} ui-button--${size} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoaderCircle className="ui-button__spinner" size={17} /> : Icon && <Icon size={17} />}
      <span>{loading ? 'Procesando...' : children}</span>
    </button>
  )
}
