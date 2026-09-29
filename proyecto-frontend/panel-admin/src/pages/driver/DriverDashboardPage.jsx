import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Clock, MapPin, Phone, Package, Truck, Navigation, AlertCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'

// Cambiamos el localhost de respaldo por tu URL real de Render
const API_URL = import.meta.env.VITE_API_URL || 'https://dulce-gusto-backend.onrender.com/api'

export default function DriverDashboardPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('assigned') // 'assigned', 'pending'

  // Fetch mis pedidos asignados
  const { data: myDeliveries = [], isLoading: loadingMy } = useQuery({
    queryKey: ['driver-deliveries'],
    queryFn: async () => {
      const { data } = await api.get('/driver/deliveries')
      return data
    },
    staleTime: 0,
    refetchInterval: 10000,
  })

  // Fetch historial
  const { data: historyDeliveries = [], isLoading: loadingHistory } = useQuery({
    queryKey: ['driver-deliveries-history'],
    queryFn: async () => {
      const { data } = await api.get('/driver/deliveries?status=history')
      return data
    },
    staleTime: 60000, // 1 min cache for history
  })

  // Fetch pedidos pendientes (para aceptar)
  const { data: pendingDeliveries = [], isLoading: loadingPending } = useQuery({
    queryKey: ['driver-pending-deliveries'],
    queryFn: async () => {
      const { data } = await api.get('/driver/deliveries/pending')
      return data
    },
    staleTime: 0,
    refetchInterval: 5000,
  })

  // Mutación para aceptar pedido
  const acceptMutation = useMutation({
    mutationFn: async (deliveryId) => {
      const { data } = await api.post(`/driver/deliveries/${deliveryId}/accept`)
      return data
    },
    onSuccess: () => {
      toast.success('Pedido aceptado con éxito')
      queryClient.invalidateQueries(['driver-deliveries'])
      queryClient.invalidateQueries(['driver-pending-deliveries'])
      setActiveTab('assigned')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Error al aceptar el pedido')
    }
  })

  // Mutación para cambiar estado
  const statusMutation = useMutation({
    mutationFn: async ({ deliveryId, status }) => {
      const { data } = await api.patch(`/driver/deliveries/${deliveryId}/status`, { status })
      return data
    },
    onSuccess: () => {
      toast.success('Estado actualizado')
      queryClient.invalidateQueries(['driver-deliveries'])
      queryClient.invalidateQueries(['driver-deliveries-history'])
    },
    onError: (err) => {
      toast.error('Error al actualizar el estado')
    }
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'assigned': return <span className="px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm"><Clock size={14}/> Nuevo</span>
      case 'accepted': return <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm"><CheckCircle2 size={14}/> Aceptado</span>
      case 'picked_up': return <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm"><Package size={14}/> Recogido</span>
      case 'on_way': return <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm"><Truck size={14}/> En Camino</span>
      case 'delivered': return <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm"><CheckCircle2 size={14}/> Entregado</span>
      case 'failed': return <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm"><AlertCircle size={14}/> Fallido</span>
      default: return <span className="px-3 py-1 bg-gray-50 text-gray-700 border border-gray-200 rounded-full text-xs font-bold shadow-sm">{status}</span>
    }
  }

  const renderDeliveryCard = (d, isPending) => {
    const order = d.order

    return (
      <div key={d.id} className="bg-white rounded-2xl p-5 flex flex-col gap-5 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
        
        {/* Accent Top Border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>

        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">Orden</p>
            <h3 className="font-extrabold text-xl text-slate-900 leading-none">#{order?.order_number}</h3>
          </div>
          <div className="flex flex-col items-end gap-2">
            {!isPending && getStatusBadge(d.status)}
            {isPending && <span className="px-3 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm"><Clock size={14}/> Pendiente</span>}
            <span className="font-bold text-lg text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">S/ {Number(order?.total).toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-slate-50/80 rounded-xl p-4 space-y-3 border border-slate-100">
          <div className="flex items-start gap-3">
            <div className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-100 shrink-0">
              <MapPin size={16} className="text-brand-500" />
            </div>
            <p className="text-sm text-slate-700 font-medium leading-tight mt-1">{order?.address}, {order?.district}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-100 shrink-0">
              <Package size={16} className="text-purple-500" />
            </div>
            <p className="text-sm text-slate-700 font-medium">{order?.customer_name}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-100 shrink-0">
              <Phone size={16} className="text-emerald-500" />
            </div>
            <a href={`tel:${order?.customer_phone}`} className="text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline">
              {order?.customer_phone}
            </a>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          {isPending ? (
            <button 
              onClick={() => acceptMutation.mutate(d.id)}
              disabled={acceptMutation.isPending}
              className="w-full bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white shadow-md hover:shadow-lg font-bold rounded-xl py-3 px-4 transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center"
            >
              Aceptar Pedido
            </button>
          ) : (
            <>
              {d.status === 'accepted' && (
                <button 
                  onClick={() => statusMutation.mutate({ deliveryId: d.id, status: 'picked_up' })}
                  disabled={statusMutation.isPending}
                  className="flex-1 bg-white border-2 border-brand-500 text-brand-600 hover:bg-brand-50 font-bold rounded-xl py-2.5 px-4 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Package size={18} /> Ya lo recogí
                </button>
              )}
              {d.status === 'picked_up' && (
                <button 
                  onClick={() => statusMutation.mutate({ deliveryId: d.id, status: 'on_way' })}
                  disabled={statusMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md hover:shadow-lg font-bold rounded-xl py-2.5 px-4 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Truck size={18} /> En Camino
                </button>
              )}
              {d.status === 'on_way' && (
                <button 
                  onClick={() => statusMutation.mutate({ deliveryId: d.id, status: 'delivered' })}
                  disabled={statusMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-md hover:shadow-lg font-bold rounded-xl py-2.5 px-4 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} /> Entregado
                </button>
              )}
              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(`${order?.address}, ${order?.district}`)}`} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 font-bold rounded-xl py-2.5 px-4 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Navigation size={18} /> Ver Mapa
              </a>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Panel de Entregas</h1>
          <p className="text-slate-500 font-medium mt-1">Gestiona tus pedidos en tiempo real</p>
        </div>
        
        {/* Segmented Control */}
        <div className="flex bg-slate-200/50 p-1 rounded-xl shadow-inner border border-slate-200">
          <button
            onClick={() => setActiveTab('assigned')}
            className={`flex-1 sm:flex-none px-5 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'assigned' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Mis Pedidos
            {myDeliveries.length > 0 && <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${activeTab === 'assigned' ? 'bg-brand-100 text-brand-700' : 'bg-slate-300 text-slate-700'}`}>{myDeliveries.length}</span>}
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 sm:flex-none px-5 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'pending' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Nuevos 
            {pendingDeliveries.length > 0 && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 sm:flex-none px-5 py-2.5 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'history' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Historial
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'assigned' ? (
          loadingMy ? (
            <p className="text-slate-400 font-medium col-span-full text-center py-10 animate-pulse">Cargando tus pedidos...</p>
          ) : myDeliveries.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
                <Package size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-600 font-bold text-lg">No tienes pedidos en curso</p>
              <p className="text-slate-400 text-sm mt-1">Revisa la pestaña "Nuevos" para aceptar entregas.</p>
            </div>
          ) : (
            myDeliveries.map(d => renderDeliveryCard(d, false))
          )
        ) : activeTab === 'pending' ? (
          loadingPending ? (
            <div className="flex justify-center py-10 col-span-full"><Loader2 className="animate-spin text-brand-500" size={40}/></div>
          ) : pendingDeliveries.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <p className="text-slate-600 font-bold text-lg">Todo al día</p>
              <p className="text-slate-400 text-sm mt-1">No hay pedidos pendientes en este momento.</p>
            </div>
          ) : (
            pendingDeliveries.map(d => renderDeliveryCard(d, true))
          )
        ) : (
          loadingHistory ? (
            <p className="text-slate-400 font-medium col-span-full text-center py-10 animate-pulse">Cargando historial...</p>
          ) : historyDeliveries.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
                <Package size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-600 font-bold text-lg">Aún no has completado entregas</p>
            </div>
          ) : (
            historyDeliveries.map(d => renderDeliveryCard(d, false))
          )
        )}
      </div>
    </div>
  )
}