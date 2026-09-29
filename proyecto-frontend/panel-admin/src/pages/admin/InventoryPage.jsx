import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Package, Edit2, X, Save } from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { useThemeStore } from '../../store/useThemeStore'

export default function InventoryPage() {
  const qc = useQueryClient()
  const { theme } = useThemeStore()
  const dark = theme === 'dark'

  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editStock, setEditStock] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', search],
    queryFn: () => api.get(`/admin/products?search=${search}&per_page=50`).then((r) => r.data),
  })

  const stockMutation = useMutation({
    mutationFn: ({ id, stock }) => api.patch(`/admin/products/${id}/stock`, { stock }),
    onSuccess: () => {
      qc.invalidateQueries(['inventory'])
      qc.invalidateQueries(['dashboard'])
      setEditingId(null)
      toast.success('Stock actualizado')
    },
    onError: () => toast.error('Error al actualizar stock'),
  })

  const products = data?.data || []
  const lowStock = products.filter((p) => p.stock <= 5)
  const outOfStock = products.filter((p) => p.stock === 0)

  const txt = dark ? 'text-white' : 'text-gray-900'
  const sub = dark ? 'text-gray-400' : 'text-gray-500'
  const skeletonCls = dark ? 'bg-gray-700' : 'bg-gray-200'
  const dividerCls = dark ? 'divide-gray-700' : 'divide-gray-50'
  const borderCls = dark ? 'border-gray-700' : 'border-gray-100'
  const theadCls = dark ? 'bg-gray-700/50' : 'bg-gray-50'
  const hoverCls = dark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${txt}`}>Inventario</h1>
        <p className={`${sub} text-sm`}>Gestiona el stock de tus productos</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <p className={`text-xs ${sub} mb-1`}>Total productos</p>
          <p className={`text-2xl font-bold ${txt}`}>{data?.total || 0}</p>
        </div>
        <div className="card p-4 border-orange-200">
          <p className="text-xs text-orange-600 mb-1">Stock bajo (≤5)</p>
          <p className="text-2xl font-bold text-orange-600">{lowStock.length}</p>
        </div>
        <div className="card p-4 border-red-200">
          <p className="text-xs text-red-600 mb-1">Sin stock</p>
          <p className="text-2xl font-bold text-red-600">{outOfStock.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4 mb-4">
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9 text-sm" placeholder="Buscar producto..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={`${theadCls} border-b ${borderCls}`}>
              <tr className={`text-xs ${sub} text-left`}>
                {['Producto', 'Categoría', 'SKU', 'Precio', 'Stock actual', 'Estado', 'Acción'].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${dividerCls}`}>
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}><td colSpan={7} className="px-4 py-3"><div className={`h-4 ${skeletonCls} animate-pulse rounded`} /></td></tr>
                  ))
                : products.map((p) => (
                    <tr key={p.id} className={`${hoverCls} transition-colors`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                            <Package size={14} className="text-brand-600" />
                          </div>
                          <span className={`font-medium ${txt} text-sm`}>{p.name}</span>
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-xs ${sub}`}>{p.category?.name}</td>
                      <td className={`px-4 py-3 font-mono text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{p.sku || '—'}</td>
                      <td className={`px-4 py-3 font-bold ${txt} text-sm`}>S/ {Number(p.price).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        {editingId === p.id ? (
                          <input
                            type="number"
                            min="0"
                            value={editStock}
                            onChange={(e) => setEditStock(e.target.value)}
                            className="input w-20 text-sm"
                            autoFocus
                          />
                        ) : (
                          <span className={`font-bold ${txt}`}>{p.stock}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs ${
                          p.stock === 0 ? 'bg-red-100 text-red-700' :
                          p.stock <= 3 ? 'bg-orange-100 text-orange-700' :
                          p.stock <= 10 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {p.stock === 0 ? 'Sin stock' : p.stock <= 3 ? 'Crítico' : p.stock <= 10 ? 'Bajo' : 'OK'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {editingId === p.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => stockMutation.mutate({ id: p.id, stock: Number(editStock) })}
                              disabled={stockMutation.isPending}
                              className="btn-primary btn-sm"
                            >
                              <Save size={13} />
                            </button>
                            <button onClick={() => setEditingId(null)} className="btn-secondary btn-sm">
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingId(p.id); setEditStock(p.stock) }}
                            className="btn-ghost btn-sm"
                          >
                            <Edit2 size={14} /> Editar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}