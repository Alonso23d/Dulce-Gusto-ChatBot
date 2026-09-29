import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Truck, User, CheckCircle, X, RefreshCw } from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { useThemeStore } from '../../store/useThemeStore'

const DELIVERY_STATUS = {
  pending:   { label: 'Pendiente',  badge: 'bg-yellow-100 text-yellow-700' },
  assigned:  { label: 'Asignado',   badge: 'bg-blue-100 text-blue-700' },
  picked_up: { label: 'Recogido',   badge: 'bg-orange-100 text-orange-700' },
  on_way:    { label: 'En camino',  badge: 'bg-indigo-100 text-indigo-700' },
  delivered: { label: 'Entregado',  badge: 'bg-green-100 text-green-700' },
  failed:    { label: 'Fallido',    badge: 'bg-red-100 text-red-700' },
}

export default function DeliveryPage() {
  const qc = useQueryClient()
  const { theme } = useThemeStore()
  const dark = theme === 'dark'

  const [statusFilter, setStatusFilter] = useState('on_way')
  const [assignModal, setAssignModal] = useState(null)
  const [selectedDriver, setSelectedDriver] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-deliveries', statusFilter],
    queryFn: () => api.get(`/admin/deliveries?status=${statusFilter}`).then((r) => r.data),
    refetchInterval: 20000,
  })

  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => api.get('/admin/drivers').then((r) => r.data),
  })

  const assignMutation = useMutation({
    mutationFn: ({ id, driver_id }) => api.patch(`/admin/deliveries/${id}/assign`, { driver_id }),
    onSuccess: () => {
      qc.invalidateQueries(['admin-deliveries'])
      setAssignModal(null)
      setSelectedDriver('')
      toast.success('Repartidor asignado')
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/admin/deliveries/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries(['admin-deliveries'])
      qc.invalidateQueries(['dashboard'])
      toast.success('Estado actualizado')
    },
  })

  const deliveries = data?.data || []

  const txt = dark ? 'text-white' : 'text-gray-900'
  const sub = dark ? 'text-gray-400' : 'text-gray-500'
  const muted = dark ? 'text-gray-500' : 'text-gray-400'
  const skeletonCls = dark ? 'bg-gray-700' : 'bg-gray-100'
  const modalBg = dark ? 'bg-gray-800' : 'bg-white'

  const tabActive = dark
    ? 'bg-brand-600 text-white border-brand-600'
    : 'bg-gray-900 text-white border-gray-900'
  const tabInactive = dark
    ? 'border-gray-600 text-gray-400 bg-gray-700 hover:border-gray-500'
    : 'border-gray-300 text-gray-600 bg-white hover:border-gray-400'

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${txt}`}>Gestión de Delivery</h1>
          <p className={`${sub} text-sm`}>{data?.total || 0} entregas</p>
        </div>
        <button onClick={() => qc.invalidateQueries(['admin-deliveries'])} className="btn-secondary btn-sm">
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {Object.entries(DELIVERY_STATUS).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setStatusFilter(k)}
            className={`btn-sm rounded-full border transition-all ${statusFilter === k ? tabActive : tabInactive}`}
          >
            {v.label}
          </button>
        ))}
        <button
          onClick={() => setStatusFilter('')}
          className={`btn-sm rounded-full border transition-all ${!statusFilter ? tabActive : tabInactive}`}
        >
          Todos
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Deliveries list */}
        <div className="lg:col-span-2 space-y-3">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <div key={i} className={`card h-28 animate-pulse ${skeletonCls}`} />)
            : deliveries.length === 0
              ? <div className={`card p-10 text-center ${muted}`}>No hay entregas para este estado</div>
              : deliveries.map((d) => {
                  const cfg = DELIVERY_STATUS[d.status]
                  const order = d.order
                  return (
                    <div key={d.id} className="card p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-mono text-xs font-bold ${sub}`}>{order?.order_number}</span>
                            <span className={`badge text-xs ${cfg?.badge}`}>{cfg?.label}</span>
                          </div>
                          <p className={`text-sm font-medium ${txt}`}>{order?.customer_name}</p>
                          <p className={`text-xs ${sub}`}>{order?.address}, {order?.district}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${txt}`}>S/ {Number(order?.delivery_cost || 0).toFixed(2)}</p>
                          <p className={`text-xs ${muted}`}>delivery</p>
                        </div>
                      </div>

                      <div className={`flex items-center gap-2 text-sm ${dark ? 'bg-gray-700/50' : 'bg-gray-50'} mb-3 rounded-lg px-3 py-2`}>
                        <User size={14} className={d.driver_name ? 'text-brand-600' : muted} />
                        {d.driver_name
                          ? <>
                              <span className={`font-medium ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{d.driver_name}</span>
                              <span className={muted}>{d.driver_phone}</span>
                            </>
                          : <span className={`text-xs italic ${muted}`}>Sin repartidor asignado</span>
                        }
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {d.status === 'pending' && (
                          <button onClick={() => setAssignModal(d)} className="btn-primary btn-sm">
                            <Truck size={13} /> Asignar repartidor
                          </button>
                        )}
                        {d.status === 'assigned' && (
                          <button onClick={() => statusMutation.mutate({ id: d.id, status: 'picked_up' })} className="btn-secondary btn-sm">
                            Marcar recogido
                          </button>
                        )}
                        {d.status === 'picked_up' && (
                          <button onClick={() => statusMutation.mutate({ id: d.id, status: 'on_way' })} className="btn-primary btn-sm">
                            <Truck size={13} /> En camino
                          </button>
                        )}
                        {d.status === 'on_way' && (
                          <button onClick={() => statusMutation.mutate({ id: d.id, status: 'delivered' })} className="btn-primary btn-sm bg-green-600 hover:bg-green-700">
                            <CheckCircle size={13} /> Entregado
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
        </div>

        {/* Drivers panel */}
        <div className="card p-5 self-start sticky top-6">
          <h2 className={`font-bold ${txt} text-sm mb-4`}>Repartidores</h2>
          <div className="space-y-3">
            {(drivers || []).map((d) => (
              <div key={d.id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 text-xs font-bold shrink-0">
                  {d.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${txt} truncate`}>{d.name}</p>
                  <p className={`text-xs ${muted}`}>{d.phone}</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assign modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${modalBg} rounded-2xl shadow-xl2 w-full max-w-sm p-5`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`font-bold ${txt}`}>Asignar repartidor</h2>
              <button onClick={() => setAssignModal(null)} className="btn-ghost p-1.5"><X size={18} /></button>
            </div>
            <p className={`text-sm ${sub} mb-4`}>
              Pedido: <strong className={dark ? 'text-gray-200' : 'text-gray-800'}>{assignModal.order?.order_number}</strong>
            </p>
            <select className="input mb-4" value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)}>
              <option value="">Seleccionar repartidor...</option>
              {(drivers || []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setAssignModal(null)} className="btn-secondary flex-1">Cancelar</button>
              <button
                disabled={!selectedDriver || assignMutation.isPending}
                onClick={() => assignMutation.mutate({ id: assignModal.id, driver_id: selectedDriver })}
                className="btn-primary flex-1"
              >
                {assignMutation.isPending ? 'Asignando...' : 'Asignar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
