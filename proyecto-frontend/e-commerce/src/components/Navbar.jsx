import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, CakeSlice, Menu, X, User, LogOut, LogIn, Cake } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'
import toast from 'react-hot-toast'
import api from '../lib/api'

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function SearchBox({ mobile = false, onClose }) {
  const [query, setQuery]   = useState('')
  const [focused, setFocused] = useState(false)
  const debounced             = useDebounce(query, 300)
  const navigate              = useNavigate()
  const inputRef              = useRef(null)

  const active = debounced.trim().length >= 2

  const { data, isFetching, isError } = useQuery({
    queryKey: ['search-suggestions', debounced],
    queryFn:  () => api.get(`/products?search=${encodeURIComponent(debounced.trim())}&per_page=6`).then((r) => r.data),
    enabled:  active,
    staleTime: 1000 * 30,
    retry: false,
  })

  const suggestions = data?.data || []
  const showDropdown = focused && query.trim().length >= 2

  const close = () => { setFocused(false); setQuery('') }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    close()
    navigate(`/catalogo?search=${encodeURIComponent(query.trim())}`)
    onClose?.()
  }

  const goToProduct = (slug) => {
    close()
    navigate(`/producto/${slug}`)
    onClose?.()
  }

  const goToAll = () => {
    const q = query.trim()
    close()
    navigate(`/catalogo?search=${encodeURIComponent(q)}`)
    onClose?.()
  }

  return (
    <div className={`relative ${mobile ? 'w-full' : 'flex-1 max-w-md'}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            onKeyDown={(e) => e.key === 'Escape' && close()}
            placeholder="Buscar tortas, cupcakes..."
            className="w-full pl-10 pr-8 py-2.5 text-base bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
          />
          {query && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { setQuery(''); inputRef.current?.focus() }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          style={{ zIndex: 9999 }}>

          {/* Buscando */}
          {isFetching && (
            <div className="px-4 py-5 flex items-center gap-2.5 text-sm text-gray-400">
              <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin shrink-0" />
              Buscando "{query}"...
            </div>
          )}

          {/* Error de conexión */}
          {isError && !isFetching && (
            <div className="px-4 py-5 text-sm text-gray-400 text-center">
              No se pudo conectar. ¿Está el servidor activo?
            </div>
          )}

          {/* Sin resultados */}
          {!isFetching && !isError && suggestions.length === 0 && active && (
            <div className="px-4 py-5 text-sm text-gray-400 text-center">
              Sin resultados para{' '}
              <span className="font-medium text-gray-600">"{debounced}"</span>
            </div>
          )}

          {/* Resultados */}
          {!isFetching && suggestions.length > 0 && (
            <>
              <div className="px-4 pt-3 pb-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  Productos encontrados
                </p>
              </div>
              <ul>
                {suggestions.map((p) => (
                  <li key={p.id}>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => goToProduct(p.slug)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-brand-50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-brand-50 to-rose-50 shrink-0">
                        {p.image
                          ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><Cake size={18} className="text-brand-300" /></div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.category?.name}</p>
                      </div>
                      <span className="text-sm font-bold text-brand-600 shrink-0">
                        S/ {Number(p.price).toFixed(2)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-100 px-4 py-2.5">
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={goToAll}
                  className="w-full flex items-center justify-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium py-1"
                >
                  <Search size={13} />
                  Ver todos los resultados para "{query}"
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const count = useCartStore((s) => s.count())
  const { user, logout } = useAuthStore()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Sesión cerrada')
    navigate('/')
  }

  const links = [
    { to: '/',         label: 'Inicio',   end: true },
    { to: '/catalogo', label: 'Catálogo' },
    { to: '/nosotros', label: 'Nosotros' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-rose-500 rounded-lg flex items-center justify-center">
            <CakeSlice size={20} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-xl">Dulce Gusto</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1 ml-4">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-lg text-base font-medium transition-all ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Desktop search */}
        <div className="hidden md:flex flex-1 max-w-md ml-auto">
          <SearchBox />
        </div>

        {/* Auth */}
        {user ? (
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <span className="text-base text-gray-600 font-medium flex items-center gap-1.5">
              <User size={18} className="text-brand-600" />
              {user.name.split(' ')[0]}
            </span>
            <button onClick={handleLogout} className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Link to="/login" className="text-base font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1.5">
              <LogIn size={18} /> Ingresar
            </Link>
            <Link to="/registro" className="btn-primary px-5 py-2.5 rounded-xl text-base font-semibold">Registrarse</Link>
          </div>
        )}

        {/* Carrito */}
        <Link to="/carrito" className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors shrink-0">
          <ShoppingCart size={20} className="text-gray-700" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </Link>

        {/* Mobile menu toggle */}
        <button className="md:hidden p-2 rounded-xl hover:bg-gray-100" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600'
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          {/* Mobile search con sugerencias */}
          <div className="pt-1">
            <SearchBox mobile onClose={() => setOpen(false)} />
          </div>

          <div className="pt-2 border-t border-gray-100">
            {user ? (
              <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100">
                <LogOut size={15} /> Cerrar sesión ({user.name.split(' ')[0]})
              </button>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={() => setOpen(false)} className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg border border-gray-200">
                  Ingresar
                </Link>
                <Link to="/registro" onClick={() => setOpen(false)} className="flex-1 text-center px-3 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg">
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
