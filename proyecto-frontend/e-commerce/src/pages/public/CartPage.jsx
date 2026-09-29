import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ChevronRight } from 'lucide-react'
import { useCartStore } from '../../store/useCartStore'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="text-gray-200 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-8">Agrega algunos productos para comenzar.</p>
        <Link to="/catalogo" className="btn-primary btn-lg">
          Ver catálogo <ChevronRight size={18} />
        </Link>
      </div>
    )
  }

  const subtotal = total()
  const deliveryEstimate = 12

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="section-title mb-8">Tu carrito</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1 space-y-3">
          {items.map((item) => (
            <div key={item.key} className="card p-4 flex gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-50 to-rose-50 rounded-xl overflow-hidden shrink-0">
                {item.product.image ? (
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🎂</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm">{item.product.name}</h3>
                {item.size && <p className="text-xs text-gray-500 mt-0.5">Tamaño: {item.size}</p>}
                {item.customization && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">"{item.customization}"</p>
                )}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1">
                    <button
                      onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="font-bold text-gray-900 text-sm ml-auto">
                    S/ {(item.product.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeItem(item.key)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="card p-5 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">Resumen</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Delivery (estimado)</span>
                <span>S/ {deliveryEstimate}.00</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                <span>Total estimado</span>
                <span>S/ {(subtotal + deliveryEstimate).toFixed(2)}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn-primary w-full mt-5 btn-lg justify-center">
              Proceder al pago
              <ChevronRight size={18} />
            </Link>
            <p className="text-xs text-gray-400 text-center mt-3">
              El costo exacto de delivery se calcula en el checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
