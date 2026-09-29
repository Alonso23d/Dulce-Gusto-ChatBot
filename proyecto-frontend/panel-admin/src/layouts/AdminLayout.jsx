import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingBag, Package, Truck, Archive, Users,
  LogOut, CakeSlice, Menu, X, ChevronRight, Sun, Moon,
  Calendar, Clock, ChevronDown,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useThemeStore } from '../store/useThemeStore'
import toast from 'react-hot-toast'

const NAV_GROUPS = [
  {
    label: 'Principal',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: 'Ventas',
    items: [
      { to: '/pedidos', label: 'Pedidos', icon: ShoppingBag },
    ],
  },
  {
    label: 'Inventario',
    items: [
      { to: '/productos', label: 'Productos', icon: Package },
      { to: '/inventario', label: 'Stock', icon: Archive },
    ],
  },
  {
    label: 'Despachos',
    items: [
      { to: '/delivery', label: 'Delivery', icon: Truck },
    ],
  },
  {
    label: 'Personas',
    items: [
      { to: '/clientes', label: 'Clientes', icon: Users },
    ],
  },
]

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items)

function TopBar({ user, dark, toggle, onLogout }) {
  const location = useLocation()
  const [now, setNow] = useState(new Date())
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const currentPage = ALL_ITEMS.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  )

  const dateStr = now.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  const barBg = dark ? 'bg-gray-900 border-gray-700/60' : 'bg-white border-gray-200'
  const txt = dark ? 'text-white' : 'text-gray-900'
  const sub = dark ? 'text-gray-400' : 'text-gray-500'
  const pillBg = dark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
  const menuBg = dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'

  return (
    <header className={`${barBg} border-b px-5 py-2.5 flex items-center gap-4 shrink-0`}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <CakeSlice size={15} className="text-brand-500 shrink-0" />
        <span className={`text-xs ${sub}`}>Dulce Gusto</span>
        {currentPage && (
          <>
            <ChevronRight size={12} className={sub} />
            <span className={`text-xs font-semibold ${txt}`}>{currentPage.label}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={toggle}
          title={dark ? 'Modo claro' : 'Modo oscuro'}
          className={`w-8 h-8 rounded-lg border ${pillBg} flex items-center justify-center transition-colors hover:border-brand-400`}
        >
          {dark
            ? <Sun size={15} className="text-yellow-400" />
            : <Moon size={15} className="text-gray-500" />}
        </button>

        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${pillBg} text-xs ${sub}`}>
          <Calendar size={13} className="text-brand-500 shrink-0" />
          <span>{dateStr}</span>
        </div>

        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${pillBg} text-xs font-mono ${sub}`}>
          <Clock size={13} className="text-brand-500 shrink-0" />
          <span>{timeStr}</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${pillBg} transition-colors hover:border-brand-400`}
          >
            <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="text-left hidden sm:block">
              <p className={`text-xs font-semibold ${txt} leading-none`}>{user?.name}</p>
              <p className={`text-[10px] ${sub} leading-none mt-0.5`}>Administrador</p>
            </div>
            <ChevronDown size={13} className={sub} />
          </button>

          {userMenuOpen && (
            <div className={`absolute right-0 top-full mt-1.5 w-44 ${menuBg} border rounded-xl shadow-lg z-50 overflow-hidden`}>
              <div className={`px-3 py-2.5 border-b ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
                <p className={`text-xs font-semibold ${txt} truncate`}>{user?.name}</p>
                <p className={`text-[10px] ${sub} truncate`}>{user?.email}</p>
              </div>
              <button
                onClick={() => { setUserMenuOpen(false); onLogout() }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={14} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const { theme, toggle } = useThemeStore()
  const navigate = useNavigate()
  const dark = theme === 'dark'

  const handleLogout = async () => {
    await logout()
    toast.success('Sesión cerrada')
    navigate('/login')
  }

  return (
    <div className={`flex h-screen overflow-hidden ${dark ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-gray-950 flex flex-col transition-all duration-300 shrink-0`}>
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shrink-0">
            <CakeSlice size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-white text-sm font-bold truncate">Dulce Gusto</p>
              <p className="text-gray-500 text-xs">Panel Admin</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-gray-500 hover:text-white transition-colors shrink-0"
          >
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>

        <nav className="flex-1 py-4 flex flex-col justify-around overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-4 mb-1 text-[10px] font-semibold tracking-widest text-gray-600 uppercase">
                  {group.label}
                </p>
              )}
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 text-sm transition-all group relative ${
                      isActive
                        ? 'bg-brand-600/20 text-brand-400 border-r-2 border-brand-400'
                        : 'text-gray-400 hover:bg-gray-800/60 hover:text-white'
                    }`
                  }
                >
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && <span>{label}</span>}
                  {!collapsed && <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-50" />}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar user={user} dark={dark} toggle={toggle} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
