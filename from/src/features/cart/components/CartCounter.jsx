import { ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useCart } from '../hooks/useCart'

export function CartCounter() {
  const { data: cart } = useCart()
  const count = cart?.total_items ?? 0
  return (
    <Link to={ROUTES.CART} className="cart-counter">
      <ShoppingCart size={20} />
      {count > 0 && <span className="cart-counter__badge">{count}</span>}
    </Link>
  )
}
