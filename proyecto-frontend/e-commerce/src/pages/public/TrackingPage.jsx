import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, Circle, MapPin, Package, Clock, Truck, Star } from 'lucide-react'
import api from '../../lib/api'

const STATUS_STEPS = [
  { key: 'pending', label: 'Pedido recibido', icon: Package },
  { key: 'confirmed', label: 'Confirmado', icon: CheckCircle },
  { key: 'preparing', label: 'En preparación', icon: Clock },
  { key: 'ready', label: 'Listo para envío', icon: Package },
  { key: 'on_way', label: 'En camino', icon: Truck },
  { key: 'delivered', label: 'Entregado', icon: CheckCircle },
]

const STATUS_ORDER = STATUS_STEPS.map((s) => s.key)

const STATUS_LABELS = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', emoji: '⏳' },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700', emoji: '✅' },
  preparing: { label: 'En preparación', color: 'bg-orange-100 text-orange-700', emoji: '👩‍🍳' },
  ready: { label: 'Listo', color: 'bg-purple-100 text-purple-700', emoji: '📦' },
  on_way: { label: 'En camino', color: 'bg-indigo-100 text-indigo-700', emoji: '🛵' },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-700', emoji: '🎉' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700', emoji: '❌' },
}

export default function TrackingPage() {
  const { orderNumber: paramOrder } = useParams()
  const [query, setQuery] = useState(paramOrder || '')
  const [searchNum, setSearchNum] = useState(paramOrder || '')
  const navigate = useNavigate()

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['track', searchNum],
    queryFn: () => api.get(`/orders/track/${searchNum}`).then((r) => r.data),
    enabled: !!searchNum,
  })

  const currentIndex = order ? STATUS_ORDER.indexOf(order.status) : -1
  const statusInfo = order ? STATUS_LABELS[order.status] : null

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="section-title mb-2">Seguimiento de pedido</h1>
      <p className="section-sub mb-8">Ingresa el número de tu pedido para ver el estado.</p>

      {/* Search */}
      <div className="flex gap-2 mb-8">
        <input
          className="input flex-1"
          placeholder="Ej: DG-2025-0001"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setSearchNum(query)}
        />
        <button
          onClick={() => { setSearchNum(query); navigate(`/seguimiento/${query}`) }}
          className="btn-primary"
        >
          Buscar
        </button>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <div className="card h-24 animate-pulse bg-gray-100" />
          <div className="card h-48 animate-pulse bg-gray-100" />
        </div>
      )}

      {error && (
        <div className="card p-8 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-500">Pedido no encontrado. Verifica el número.</p>
        </div>
      )}

      {order && statusInfo && (
        <div className="space-y-4">
          {/* Status banner */}
          <div className={`rounded-2xl p-5 text-center ${statusInfo.color.replace('text-', 'border-').replace('bg-', 'border-').split(' ')[0]} border-2 ${statusInfo.color}`}>
            <div className="text-4xl mb-2">{statusInfo.emoji}</div>
            <p className="font-bold text-lg">{statusInfo.label}</p>
            <p className="text-sm mt-1 opacity-80">Pedido {order.order_number}</p>
          </div>

          {/* Timeline */}
          {order.status !== 'cancelled' && (
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Progreso del pedido</h3>
              <div className="space-y-3">
                {STATUS_STEPS.map((step, i) => {
                  const done = i <= currentIndex
                  const current = i === currentIndex
                  return (
                    <div key={step.key} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          done ? 'bg-brand-600' : 'border-2 border-gray-200'
                        }`}>
                          {done && <CheckCircle size={12} className="text-white" />}
                        </div>
                        {i < STATUS_STEPS.length - 1 && (
                          <div className={`w-0.5 h-6 mt-1 ${done && i < currentIndex ? 'bg-brand-600' : 'bg-gray-200'}`} />
                        )}
                      </div>
                      <div className="pb-1">
                        <p className={`text-sm font-medium ${current ? 'text-brand-700' : done ? 'text-gray-700' : 'text-gray-400'}`}>
                          {step.label}
                          {current && <span className="ml-2 text-xs text-brand-500">← Actual</span>}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Delivery info */}
          {order.delivery?.driver_name && (
            <div className="card p-4">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Repartidor asignado</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold">
                  {order.delivery.driver_name[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{order.delivery.driver_name}</p>
                  <p className="text-xs text-gray-500">{order.delivery.driver_phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Delivery address */}
          <div className="card p-4">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Dirección de entrega</h3>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin size={16} className="text-brand-600 shrink-0 mt-0.5" />
              <div>
                <p>{order.address}</p>
                {order.address_reference && <p className="text-gray-400 text-xs mt-0.5">{order.address_reference}</p>}
                <p className="text-xs text-gray-400 mt-0.5">{order.district}</p>
              </div>
            </div>
          </div>

          {/* Order items */}
          <div className="card p-4">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Detalle del pedido</h3>
            <div className="space-y-2">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.product_name} x{item.quantity}</span>
                  <span className="font-medium text-gray-900">S/ {Number(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-bold text-gray-900">
              <span>Total pagado</span>
              <span>S/ {Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
