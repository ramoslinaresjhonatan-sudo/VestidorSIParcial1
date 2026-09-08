import { useEffect } from 'react'
import { X } from 'lucide-react'
import './Modal.css'

export function Modal({ isOpen, onClose, title, description, children, size = 'md' }) {
  useEffect(() => {
    if (!isOpen) return undefined
    const closeOnEscape = (event) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', closeOnEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className={`modal-panel modal-panel--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <h2 id="modal-title">{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </header>
        <div className="modal-content">{children}</div>
      </section>
    </div>
  )
}
