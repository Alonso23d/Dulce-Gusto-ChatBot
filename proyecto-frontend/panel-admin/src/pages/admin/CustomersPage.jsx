import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Users, ChevronLeft, ChevronRight, X, ShoppingBag } from 'lucide-react'
import api from '../../lib/api'
import { useThemeStore } from '../../store/useThemeStore'

const STATUS_BADGES = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-orange-100 text-orange-700',
  ready: 'bg-purple-100 text-purple-700',
  on_way: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}
const STATUS_LABELS = {
  pending: 'Pendiente', confirmed: 'Confirmado', preparing: 'En preparación',
  ready: 'Listo', on_way: 'En camino', delivered: 'Entregado', cancelled: 'Cancelado',
}

export default function CustomersPage() {
  const { theme } = useThemeStore()
  const dark = theme === 'dark'

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', page, search],
    queryFn: () => api.get(`/admin/customers?page=${page}&search=${search}`).then((r) => r.data),
  })

  const { data: customerOrders, isLoading: loadingOrders } = useQuery({
    queryKey: ['customer-orders', selected?.customer_email],
    queryFn: () => api.get(`/admin/customers/${encodeURIComponent(selected.customer_email)}/orders`).then((r) => r.data),
    enabled: !!selected,
  })

  const customers = data?.data || []
  const meta = data || {}

  const txt = dark ? 'text-white' : 'text-gray-900'
  const sub = dark ? 'text-gray-400' : 'text-gray-500'
  const muted = dark ? 'text-gray-500' : 'text-gray-400'
  const skeletonCls = dark ? 'bg-gray-700' : 'bg-gray-200'
  const dividerCls = dark ? 'divide-gray-700' : 'divide-gray-50'
  const borderCls = dark ? 'border-gray-700' : 'border-gray-100'
  const theadCls = dark ? 'bg-gray-700/50' : 'bg-gray-50'
  const hoverCls = dark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
  const modalBg = dark ? 'bg-gray-800' : 'bg-white'

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${txt}`}>Clientes</h1>
          <p className={`${sub} text-sm`}>{meta.total || 0} clientes registrados en pedidos</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${dark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <Users size={16} className="text-brand-600" />
          <span className={`text-sm font-medium ${txt}`}>{meta.total || 0}</span>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4 mb-4">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9 text-sm"
            placeholder="Buscar por nombre, email o teléfono..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={`${theadCls} border-b ${borderCls}`}>
              <tr className={`text-xs ${sub} text-left`}>
                {['Cliente', 'Email', 'Teléfono', 'Distrito', 'Pedidos', 'Total gastado', 'Último pedido', 'Detalle'].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${dividerCls}`}>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}><td colSpan={8} className="px-4 py-3"><div className={`h-4 ${skeletonCls} animate-pulse rounded`} /></td></tr>
                  ))
                : customers.length === 0
                  ? <tr><td colSpan={8} className={`px-4 py-10 text-center text-sm ${muted}`}>No hay clientes aún</td></tr>
                  : customers.map((c) => (
                      <tr key={c.customer_email} className={`${hoverCls} transition-colors`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold shrink-0">
                              {c.customer_name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <span className={`font-medium text-sm ${txt}`}>{c.customer_name}</span>
                          </div>
                        </td>
                        <td className={`px-4 py-3 text-xs ${sub}`}>{c.customer_email}</td>
                        <td className={`px-4 py-3 text-xs ${sub}`}>{c.customer_phone}</td>
                        <td className={`px-4 py-3 text-xs ${sub}`}>{c.district}</td>
                        <td className="px-4 py-3">
                          <span className="badge bg-brand-50 text-brand-700 text-xs font-bold">{c.total_orders}</span>
                        </td>
                        <td className={`px-4 py-3 font-bold ${txt} text-xs`}>S/ {Number(c.total_spent).toFixed(2)}</td>
                        <td className={`px-4 py-3 text-xs ${muted}`}>
                          {new Date(c.last_order_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelected(c)}
                            className="btn-secondary btn-sm text-xs"
                          >
                            <ShoppingBag size={12} /> Ver pedidos
                          </button>
                        </td>
                      </tr>
                    ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className={`flex items-center justify-between px-4 py-3 border-t ${borderCls}`}>
            <span className={`text-xs ${sub}`}>Página {page} de {meta.last_page}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary btn-sm disabled:opacity-40">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={page === meta.last_page} className="btn-secondary btn-sm disabled:opacity-40">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Orders modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${modalBg} rounded-2xl shadow-xl2 w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
            <div className={`flex items-center justify-between p-5 border-b ${borderCls}`}>
              <div>
                <h2 className={`font-bold ${txt}`}>{selected.customer_name}</h2>
                <p className={`text-xs ${sub} mt-0.5`}>{selected.customer_email} · {selected.customer_phone}</p>
              </div>
              <button onClick={() => setSelected(null)} className="btn-ghost p-1.5"><X size={18} /></button>
            </div>
            <div className="p-5">
              <h3 className={`text-xs font-semibold ${sub} uppercase mb-3`}>
                Historial de pedidos ({customerOrders?.length || 0})
              </h3>
              {loadingOrders
                ? <div className={`h-4 ${skeletonCls} animate-pulse rounded`} />
                : (customerOrders || []).length === 0
                  ? <p className={`text-sm ${muted} text-center py-6`}>Sin pedidos</p>
                  : (customerOrders || []).map((o) => (
                      <div key={o.id} className={`border ${borderCls} rounded-xl p-4 mb-3`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-mono text-xs font-bold ${sub}`}>{o.order_number}</span>
                          <span className={`badge text-xs ${STATUS_BADGES[o.status]}`}>{STATUS_LABELS[o.status]}</span>
                        </div>
                        <div className="space-y-1 mb-2">
                          {o.items?.map((item) => (
                            <div key={item.id} className="flex justify-between text-xs">
                              <span className={dark ? 'text-gray-300' : 'text-gray-600'}>{item.product_name} x{item.quantity}</span>
                              <span className={sub}>S/ {Number(item.subtotal).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className={`flex justify-between text-xs border-t ${borderCls} pt-2`}>
                          <span className={muted}>{new Date(o.created_at).toLocaleDateString('es-PE')}</span>
                          <span className={`font-bold ${txt}`}>S/ {Number(o.total).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}