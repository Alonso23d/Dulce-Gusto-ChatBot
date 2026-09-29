import { Link } from 'react-router-dom'
import { ShoppingCart, Star, Cake } from 'lucide-react'
import { useCartStore } from '../store/useCartStore'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem)

  const handleAdd = (e) => {
    e.preventDefault()
    addItem(product)
    toast.success(`${product.name} agregado al carrito`)
  }

  return (
    <Link
      to={`/producto/${product.slug}`}
      className="card group hover:shadow-card-hover transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-brand-50 to-rose-50 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Cake size={48} className="text-brand-200" /></div>
        )}
        {product.is_featured && (
          <span className="absolute top-3 left-3 badge bg-brand-600 text-white text-xs">
            Destacado
          </span>
        )}
        {product.stock <= 3 && product.stock > 0 && (
          <span className="absolute top-3 right-3 badge bg-orange-100 text-orange-700">
            Últimos {product.stock}
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
            <span className="badge bg-gray-100 text-gray-700">Agotado</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="text-xs text-brand-600 font-medium">{product.category?.name}</div>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-brand-700 transition-colors">
          {product.name}
        </h3>

        {product.rating > 0 && (
          <div className="flex items-center gap-1">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="text-xs text-gray-600">{product.rating} ({product.reviews_count})</span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-bold text-gray-900 text-base">
            S/ {Number(product.price).toFixed(2)}
          </span>
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="btn-primary btn-sm disabled:opacity-40"
          >
            <ShoppingCart size={13} />
            Añadir
          </button>
        </div>
      </div>
    </Link>
  )
}
