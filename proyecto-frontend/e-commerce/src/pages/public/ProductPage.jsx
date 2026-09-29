import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ShoppingCart, Star, ChevronLeft, Minus, Plus, Truck, ShieldCheck } from 'lucide-react'
import api from '../../lib/api'
import { useCartStore } from '../../store/useCartStore'
import ProductCard from '../../components/ProductCard'
import toast from 'react-hot-toast'

export default function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)

  const [qty, setQty] = useState(1)
  const [size, setSize] = useState(null)
  const [customization, setCustomization] = useState('')

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.get(`/products/${slug}`).then((r) => r.data),
  })

  const { data: related } = useQuery({
    queryKey: ['related', product?.category_id],
    queryFn: () =>
      api.get(`/products?category=${product.category?.slug}&per_page=4`).then((r) => r.data),
    enabled: !!product?.category_id,
  })

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-100 animate-pulse rounded-2xl" />
        <div className="space-y-4">
          <div className="h-6 bg-gray-100 animate-pulse rounded w-1/3" />
          <div className="h-10 bg-gray-100 animate-pulse rounded w-3/4" />
          <div className="h-8 bg-gray-100 animate-pulse rounded w-1/4" />
        </div>
      </div>
    )
  }

  if (!product) return <div className="text-center py-20 text-gray-400">Producto no encontrado</div>

  const handleAdd = () => {
    addItem(product, qty, size, customization)
    toast.success('Agregado al carrito')
  }

  const total = (product.price * qty).toFixed(2)
  const sizes = product.sizes || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ChevronLeft size={16} />
        Volver
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="aspect-square bg-gradient-to-br from-brand-50 to-rose-50 rounded-3xl overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[120px]">🎂</div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
              {product.category?.name}
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{product.name}</h1>

          {product.rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">{product.rating} ({product.reviews_count} reseñas)</span>
            </div>
          )}

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">S/ {Number(product.price).toFixed(2)}</span>
            <span className="text-gray-400 text-sm">/ unidad</span>
          </div>

          {product.description && (
            <p className="text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
              {product.description}
            </p>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div>
              <label className="label">Tamaño</label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s === size ? null : s)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                      size === s
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customization */}
          <div>
            <label className="label">Personalización (opcional)</label>
            <input
              value={customization}
              onChange={(e) => setCustomization(e.target.value)}
              className="input"
              placeholder='Ej: "Feliz cumpleaños Ana"'
              maxLength={100}
            />
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <label className="label mb-0">Cantidad</label>
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-semibold text-gray-900">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                disabled={qty >= product.stock}
                className="text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-30"
              >
                <Plus size={16} />
              </button>
            </div>
            <span className="text-sm font-bold text-gray-900 ml-auto">
              Total: S/ {total}
            </span>
          </div>

          {/* Stock info */}
          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-sm text-orange-600 font-medium">
              ¡Solo quedan {product.stock} unidades!
            </p>
          )}

          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="btn-primary btn-lg w-full disabled:opacity-40 mt-2"
          >
            <ShoppingCart size={20} />
            {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
          </button>

          {/* Delivery info */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2.5">
              <Truck size={15} className="text-brand-600 shrink-0" />
              Delivery en Lima
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2.5">
              <ShieldCheck size={15} className="text-brand-600 shrink-0" />
              Pago seguro
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related?.data?.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title mb-6">También te puede gustar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.data.filter((p) => p.id !== product.id).slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
