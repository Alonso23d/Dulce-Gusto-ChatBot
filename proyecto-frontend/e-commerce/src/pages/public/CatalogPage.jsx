import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { SlidersHorizontal, Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../lib/api'
import ProductCard from '../../components/ProductCard'

export default function CatalogPage() {
  const [params, setParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    search: params.get('search') || '',
    category: params.get('category') || '',
    min_price: '',
    max_price: '',
    sort: 'created_at',
    dir: 'desc',
  })
  const [showFilters, setShowFilters] = useState(false)

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  })

  const buildQuery = () => {
    const q = new URLSearchParams()
    if (filters.search) q.set('search', filters.search)
    if (filters.category) q.set('category', filters.category)
    if (filters.min_price) q.set('min_price', filters.min_price)
    if (filters.max_price) q.set('max_price', filters.max_price)
    q.set('sort', filters.sort)
    q.set('dir', filters.dir)
    q.set('page', page)
    q.set('per_page', 12)
    return q.toString()
  }

  const { data, isLoading } = useQuery({
    queryKey: ['products', filters, page],
    queryFn: () => api.get(`/products?${buildQuery()}`).then((r) => r.data),
    keepPreviousData: true,
  })

  const products = data?.data || []
  const meta = data?.meta || {}

  const setFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({ search: '', category: '', min_price: '', max_price: '', sort: 'created_at', dir: 'desc' })
    setPage(1)
  }

  const cats = categories || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Catálogo</h1>
          <p className="section-sub">{data?.total || 0} productos disponibles</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary md:hidden"
        >
          <SlidersHorizontal size={16} />
          Filtros
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className={`w-56 shrink-0 ${showFilters ? 'block' : 'hidden'} md:block`}>
          <div className="card p-4 sticky top-24 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-gray-900">Filtros</h3>
              <button onClick={clearFilters} className="text-xs text-brand-600 hover:underline">
                Limpiar
              </button>
            </div>

            {/* Search */}
            <div>
              <label className="label">Buscar</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={filters.search}
                  onChange={(e) => setFilter('search', e.target.value)}
                  className="input pl-9 text-sm"
                  placeholder="Nombre..."
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="label">Categoría</label>
              <div className="space-y-1.5">
                <button
                  onClick={() => setFilter('category', '')}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                    !filters.category ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Todas
                </button>
                {cats.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setFilter('category', c.slug)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      filters.category === c.slug ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="label">Precio (S/)</label>
              <div className="flex gap-2">
                <input
                  value={filters.min_price}
                  onChange={(e) => setFilter('min_price', e.target.value)}
                  className="input text-sm"
                  placeholder="Mín"
                  type="number"
                />
                <input
                  value={filters.max_price}
                  onChange={(e) => setFilter('max_price', e.target.value)}
                  className="input text-sm"
                  placeholder="Máx"
                  type="number"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="label">Ordenar por</label>
              <select
                value={`${filters.sort}-${filters.dir}`}
                onChange={(e) => {
                  const [sort, dir] = e.target.value.split('-')
                  setFilters((f) => ({ ...f, sort, dir }))
                  setPage(1)
                }}
                className="input text-sm"
              >
                <option value="created_at-desc">Más recientes</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="rating-desc">Mejor valorados</option>
                <option value="name-asc">A - Z</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="card h-64 animate-pulse bg-gray-100" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              {/* Pagination */}
              {data?.last_page > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    className="btn-secondary btn-sm disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm text-gray-600">
                    Página {page} de {data.last_page}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === data.last_page}
                    className="btn-secondary btn-sm disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-500">No se encontraron productos con estos filtros.</p>
              <button onClick={clearFilters} className="btn-primary mt-4">
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
