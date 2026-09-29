import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, RefreshCw, ChevronLeft, ChevronRight, X } from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { useThemeStore } from '../../store/useThemeStore'

const STATUS_CONFIG = {
  pending:   { label: 'Pendiente',      badge: 'bg-yellow-100 text-yellow-700', next: ['confirmed', 'cancelled'] },
  confirmed: { label: 'Confirmado',     badge: 'bg-blue-100 text-blue-700',     next: ['preparing', 'cancelled'] },
  preparing: { label: 'En preparación', badge: 'bg-orange-100 text-orange-700', next: ['ready'] },
  ready:     { label: 'Listo',          badge: 'bg-purple-100 text-purple-700', next: ['on_way'] },
  on_way:    { label: 'En camino',      badge: 'bg-indigo-100 text-indigo-700', next: ['delivered'] },
  delivered: { label: 'Entregado',      badge: 'bg-green-100 text-green-700',   next: [] },
  cancelled: { label: 'Cancelado',      badge: 'bg-red-100 text-red-700',       next: [] },
}

const PAYMENT_LABELS = {
  yape: 'Yape', plin: 'Plin', visa: 'Visa', bcp: 'BCP', transfer: 'Transferencia', cash: 'Efectivo',
}

export default function OrdersPage() {
  const qc = useQueryClient()
  const { theme } = useThemeStore()
  const dark = theme === 'dark'

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [cancelReason, setCancelReason] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, search, statusFilter],
    queryFn: () => api.get(`/admin/orders?page=${page}&search=${search}&status=${statusFilter}`).then((r) => r.data),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status, reason }) =>
      api.patch(`/admin/orders/${id}/status`, { status, cancellation_reason: reason }),
    onSuccess: () => {
      qc.invalidateQueries(['admin-orders'])
      qc.invalidateQueries(['dashboard'])
      setSelected(null)
      toast.success('Estado actualizado')
    },
    onError: () => toast.error('Error al actualizar estado'),
  })

  const orders = data?.data || []
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
          <h1 className={`text-2xl font-bold ${txt}`}>Gestión de Pedidos</h1>
          <p className={`${sub} text-sm`}>{meta.total || 0} pedidos en total</p>
        </div>
        <button onClick={() => qc.invalidateQueries(['admin-orders'])} className="btn-secondary btn-sm">
          <RefreshCw size={14} />
          Actualizar
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9 text-sm"
            placeholder="Buscar por ID, cliente, teléfono..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="input w-auto text-sm"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={`${theadCls} border-b ${borderCls}`}>
              <tr className={`text-xs ${sub} text-left`}>
                {['ID', 'Hora', 'Cliente', 'Distrito', 'Total', 'Pago', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${dividerCls}`}>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}><td colSpan={8} className="px-4 py-3"><div className={`h-4 ${skeletonCls} animate-pulse rounded`} /></td></tr>
                  ))
                : orders.map((o) => {
                    const cfg = STATUS_CONFIG[o.status]
                    return (
                      <tr key={o.id} className={`${hoverCls} transition-colors`}>
                        <td className={`px-4 py-3 font-mono text-xs ${sub} font-medium`}>{o.order_number}</td>
                        <td className={`px-4 py-3 text-xs ${muted} whitespace-nowrap`}>
                          {new Date(o.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3">
                          <p className={`font-medium text-xs ${dark ? 'text-gray-200' : 'text-gray-800'}`}>{o.customer_name}</p>
                          <p className={`text-xs ${muted}`}>{o.customer_phone}</p>
                        </td>
                        <td className={`px-4 py-3 text-xs ${sub}`}>{o.district}</td>
                        <td className={`px-4 py-3 font-bold ${txt} text-xs whitespace-nowrap`}>
                          S/ {Number(o.total).toFixed(2)}
                        </td>
                        <td className={`px-4 py-3 text-xs ${sub}`}>{PAYMENT_LABELS[o.payment_method]}</td>
                        <td className="px-4 py-3">
                          <span className={`badge text-xs ${cfg?.badge}`}>{cfg?.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => setSelected(o)} className="btn-secondary btn-sm text-xs">
                            Ver / Estado
                          </button>
                        </td>
                      </tr>
                    )
                  })}
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

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${modalBg} rounded-2xl shadow-xl2 w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
            <div className={`flex items-center justify-between p-5 border-b ${borderCls}`}>
              <h2 className={`font-bold ${txt}`}>{selected.order_number}</h2>
              <button onClick={() => setSelected(null)} className="btn-ghost p-1.5">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Customer */}
              <div>
                <h3 className={`text-xs font-semibold ${sub} uppercase mb-2`}>Cliente</h3>
                <p className={`text-sm ${txt} font-medium`}>{selected.customer_name}</p>
                <p className={`text-xs ${sub}`}>{selected.customer_email} · {selected.customer_phone}</p>
              </div>
              {/* Address */}
              <div>
                <h3 className={`text-xs font-semibold ${sub} uppercase mb-2`}>Entrega</h3>
                <p className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{selected.address}, {selected.district}</p>
                <p className={`text-xs ${sub} mt-0.5`}>Fecha: {new Date(selected.delivery_date).toLocaleDateString('es-PE')}</p>
              </div>
              {/* Items */}
              <div>
                <h3 className={`text-xs font-semibold ${sub} uppercase mb-2`}>Productos</h3>
                {selected.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span className={dark ? 'text-gray-300' : 'text-gray-700'}>{item.product_name} x{item.quantity}</span>
                    <span className={`font-medium ${txt}`}>S/ {Number(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
                <div className={`flex justify-between font-bold ${txt} border-t ${borderCls} pt-2 mt-1`}>
                  <span>Total</span>
                  <span>S/ {Number(selected.total).toFixed(2)}</span>
                </div>
              </div>

              {/* Voucher */}
              <div>
                <h3 className={`text-xs font-semibold ${sub} uppercase mb-2`}>Comprobante de pago</h3>
                {selected.voucher_path ? (
                  <a
                    // URL de Render actualizada aquí
                    href={`https://dulce-gusto-backend.onrender.com/storage/${selected.voucher_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      // URL de Render actualizada aquí
                      src={`https://dulce-gusto-backend.onrender.com/storage/${selected.voucher_path}`}
                      alt="Voucher"
                      className="w-full max-h-64 object-contain rounded-xl border border-green-300 cursor-zoom-in hover:opacity-90 transition-opacity"
                    />
                    <p className="text-xs text-green-600 mt-1 text-center">Ver imagen completa →</p>
                  </a>
                ) : (
                  <div className={`flex items-center gap-2 px-3 py-3 rounded-xl border border-dashed ${dark ? 'border-gray-600 text-gray-500' : 'border-gray-300 text-gray-400'} text-xs`}>
                    <span>⏳</span>
                    <span>El cliente aún no ha subido el comprobante</span>
                  </div>
                )}
              </div>
              {/* Status change */}
              {STATUS_CONFIG[selected.status]?.next.length > 0 && (
                <div>
                  <h3 className={`text-xs font-semibold ${sub} uppercase mb-2`}>Cambiar estado</h3>
                  {STATUS_CONFIG[selected.status].next.map((nextStatus) => (
                    <div key={nextStatus}>
                      {nextStatus === 'cancelled' && (
                        <input
                          className="input text-sm mb-2"
                          placeholder="Motivo de cancelación..."
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                        />
                      )}
                      <button
                        onClick={() => statusMutation.mutate({ id: selected.id, status: nextStatus, reason: cancelReason })}
                        disabled={statusMutation.isPending}
                        className={`w-full mb-2 ${nextStatus === 'cancelled' ? 'btn-danger' : 'btn-primary'} btn-sm`}
                      >
                        {nextStatus === 'cancelled' ? 'Cancelar pedido' : `Marcar como: ${STATUS_CONFIG[nextStatus].label}`}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}