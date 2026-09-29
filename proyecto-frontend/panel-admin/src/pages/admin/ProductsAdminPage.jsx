import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit2, Trash2, X, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { useThemeStore } from '../../store/useThemeStore'

const EMPTY = {
  name: '', category_id: '', description: '', price: '', stock: '',
  sku: '', image: '', is_active: true, is_featured: false,
}

export default function ProductsAdminPage() {
  const qc = useQueryClient()
  const { theme } = useThemeStore()
  const dark = theme === 'dark'

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)       // null | 'create' | product object (edit)
  const [deleteTarget, setDeleteTarget] = useState(null)  // product to confirm delete
  const [form, setForm] = useState(EMPTY)

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api.get('/admin/categories').then((r) => r.data),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => api.get(`/admin/products?page=${page}&search=${search}&per_page=15`).then((r) => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: (d) => modal === 'create'
      ? api.post('/admin/products', d)
      : api.put(`/admin/products/${modal.id}`, d),
    onSuccess: () => {
      qc.invalidateQueries(['admin-products'])
      setModal(null)
      toast.success(modal === 'create' ? 'Producto creado' : 'Producto actualizado')
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al guardar'),
  })

  const toggleMutation = useMutation({
    mutationFn: (p) => api.put(`/admin/products/${p.id}`, { is_active: !p.is_active }),
    onSuccess: () => qc.invalidateQueries(['admin-products']),
    onError: () => toast.error('Error al cambiar estado'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/products/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(['admin-products'])
      setDeleteTarget(null)
      toast.success('Producto eliminado')
    },
    onError: () => toast.error('Error al eliminar'),
  })

  const openCreate = () => { setForm(EMPTY); setModal('create') }
  const openEdit = (p) => {
    setForm({
      name: p.name,
      category_id: p.category_id,
      description: p.description || '',
      price: p.price,
      stock: p.stock,
      sku: p.sku || '',
      image: p.image || '',
      is_active: p.is_active,
      is_featured: p.is_featured,
    })
    setModal(p)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    saveMutation.mutate({
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    })
  }

  const products  = data?.data       || []
  const lastPage  = data?.last_page  || 1
  const total     = data?.total      || 0

  // — Estilos dark/light —
  const txt        = dark ? 'text-white'          : 'text-gray-900'
  const sub        = dark ? 'text-gray-400'        : 'text-gray-500'
  const skeletonCls = dark ? 'bg-gray-700'         : 'bg-gray-200'
  const dividerCls  = dark ? 'divide-gray-700'     : 'divide-gray-50'
  const borderCls   = dark ? 'border-gray-700'     : 'border-gray-100'
  const theadCls    = dark ? 'bg-gray-700/50'      : 'bg-gray-50'
  const hoverCls    = dark ? 'hover:bg-gray-700/50': 'hover:bg-gray-50'
  const modalBg     = dark ? 'bg-gray-800'         : 'bg-white'
  const labelCls    = dark ? 'text-gray-300'       : ''
  const pageBtnBase = `w-8 h-8 rounded-lg text-sm font-medium transition-colors flex items-center justify-center`

  return (
    <div className="flex-1 overflow-y-auto p-6">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${txt}`}>Productos</h1>
          <p className={`${sub} text-sm`}>{total} productos en total</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      {/* Search */}
      <div className="card p-4 mb-4">
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9 text-sm"
            placeholder="Buscar producto..."
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
                {['Producto', 'Categoría', 'Precio', 'Stock', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${dividerCls}`}>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-4 py-3">
                        <div className={`h-4 ${skeletonCls} animate-pulse rounded`} />
                      </td>
                    </tr>
                  ))
                : products.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} className={`px-4 py-10 text-center ${sub}`}>
                        No se encontraron productos
                      </td>
                    </tr>
                  )
                  : products.map((p) => (
                    <tr key={p.id} className={`${hoverCls} transition-colors`}>
                      {/* Nombre + imagen */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.image
                            ? <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                            : <div className={`w-9 h-9 rounded-lg ${dark ? 'bg-gray-700' : 'bg-gray-100'} shrink-0`} />
                          }
                          <div>
                            <p className={`font-medium ${txt} text-sm`}>{p.name}</p>
                            <p className={`text-xs ${sub}`}>{p.sku}</p>
                          </div>
                        </div>
                      </td>
                      {/* Categoría */}
                      <td className="px-4 py-3">
                        <span className="badge bg-brand-50 text-brand-700 text-xs">{p.category?.name}</span>
                      </td>
                      {/* Precio */}
                      <td className={`px-4 py-3 font-bold ${txt} text-sm`}>
                        S/ {Number(p.price).toFixed(2)}
                      </td>
                      {/* Stock */}
                      <td className="px-4 py-3">
                        <span className={`badge text-xs ${
                          p.stock === 0      ? 'bg-red-100 text-red-700'    :
                          p.stock <= 3       ? 'bg-orange-100 text-orange-700' :
                                              'bg-green-100 text-green-700'
                        }`}>
                          {p.stock === 0 ? 'Agotado' : `${p.stock} und.`}
                        </span>
                      </td>
                      {/* Toggle activo */}
                      <td className="px-4 py-3">
                        <button onClick={() => toggleMutation.mutate(p)} className="flex items-center gap-1.5 text-xs">
                          {p.is_active
                            ? <ToggleRight size={18} className="text-green-500" />
                            : <ToggleLeft  size={18} className="text-gray-400" />}
                          <span className={p.is_active ? 'text-green-600' : 'text-gray-400'}>
                            {p.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </button>
                      </td>
                      {/* Acciones */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(p)} className="btn-ghost btn-sm" title="Editar">
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="btn-ghost btn-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {lastPage > 1 && (
          <div className={`flex items-center justify-between px-4 py-3 border-t ${borderCls}`}>
            <p className={`text-xs ${sub}`}>
              Página {page} de {lastPage} · {total} productos
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`${pageBtnBase} ${dark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'} disabled:opacity-40`}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: lastPage }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push('...')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) =>
                  p === '...'
                    ? <span key={`dots-${i}`} className={`${pageBtnBase} ${sub}`}>…</span>
                    : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`${pageBtnBase} ${
                          page === p
                            ? 'bg-brand-600 text-white'
                            : dark
                              ? 'hover:bg-gray-700 text-gray-300'
                              : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        {p}
                      </button>
                    )
                )}

              <button
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={page === lastPage}
                className={`${pageBtnBase} ${dark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'} disabled:opacity-40`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal crear / editar ── */}
      {modal !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${modalBg} rounded-2xl shadow-xl2 w-full max-w-md max-h-[90vh] overflow-y-auto`}>
            <div className={`flex items-center justify-between p-5 border-b ${borderCls}`}>
              <h2 className={`font-bold ${txt}`}>
                {modal === 'create' ? 'Nuevo producto' : `Editar: ${modal.name}`}
              </h2>
              <button onClick={() => setModal(null)} className="btn-ghost p-1.5">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Nombre */}
              <div>
                <label className={`label ${labelCls}`}>Nombre *</label>
                <input
                  className="input" required
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              {/* Categoría + SKU */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`label ${labelCls}`}>Categoría *</label>
                  <select
                    className="input" required
                    value={form.category_id}
                    onChange={(e) => setForm(f => ({ ...f, category_id: e.target.value }))}
                  >
                    <option value="">Seleccionar...</option>
                    {(categories || []).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`label ${labelCls}`}>SKU</label>
                  <input
                    className="input"
                    value={form.sku}
                    onChange={(e) => setForm(f => ({ ...f, sku: e.target.value }))}
                  />
                </div>
              </div>

              {/* Imagen */}
              <div>
                <label className={`label ${labelCls}`}>URL de imagen</label>
                <input
                  className="input"
                  placeholder="https://..."
                  value={form.image}
                  onChange={(e) => setForm(f => ({ ...f, image: e.target.value }))}
                />
                {form.image && (
                  <img
                    src={form.image}
                    alt="preview"
                    className="mt-2 h-24 w-24 object-cover rounded-xl border"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className={`label ${labelCls}`}>Descripción</label>
                <textarea
                  className="input resize-none h-20"
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              {/* Precio + Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`label ${labelCls}`}>Precio (S/) *</label>
                  <input
                    className="input" required
                    type="number" min="0" step="0.01"
                    value={form.price}
                    onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={`label ${labelCls}`}>Stock *</label>
                  <input
                    className="input" required
                    type="number" min="0"
                    value={form.stock}
                    onChange={(e) => setForm(f => ({ ...f, stock: e.target.value }))}
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex gap-4">
                <label className={`flex items-center gap-2 text-sm cursor-pointer ${labelCls}`}>
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))}
                    className="rounded"
                  />
                  Activo
                </label>
                <label className={`flex items-center gap-2 text-sm cursor-pointer ${labelCls}`}>
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm(f => ({ ...f, is_featured: e.target.checked }))}
                    className="rounded"
                  />
                  Destacado
                </label>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button type="submit" disabled={saveMutation.isPending} className="btn-primary flex-1">
                  {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal confirmación de eliminar ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${modalBg} rounded-2xl shadow-xl2 w-full max-w-sm p-6`}>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={22} className="text-red-600" />
              </div>
              <h2 className={`font-bold text-lg ${txt}`}>¿Eliminar producto?</h2>
              <p className={`text-sm ${sub}`}>
                Se desactivará <span className="font-semibold">{deleteTarget.name}</span> y
                dejará de aparecer en la tienda. Esta acción se puede revertir.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="btn-danger flex-1"
              >
                {deleteMutation.isPending ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
