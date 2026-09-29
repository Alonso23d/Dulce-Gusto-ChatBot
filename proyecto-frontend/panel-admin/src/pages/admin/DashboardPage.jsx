import { useQuery } from '@tanstack/react-query'
import { TrendingUp, ShoppingBag, Clock, Truck, AlertTriangle, DollarSign } from 'lucide-react'
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
const STATUS_COLORS = {
  pending: '#f59e0b', confirmed: '#3b82f6', preparing: '#f97316',
  ready: '#a855f7', on_way: '#6366f1', delivered: '#22c55e', cancelled: '#ef4444',
}

function Sparkline({ data, color = '#7c3aed', height = 40 }) {
  if (!data || data.length < 2) {
    return <div style={{ height }} className="flex items-center justify-center text-xs text-gray-400">Sin datos</div>
  }
  const vals = data.map((d) => Number(d.total) || 0)
  const max = Math.max(...vals, 1)
  const w = 200
  const h = height
  const points = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * w
    const y = h - (v / max) * (h - 4) - 2
    return `${x},${y}`
  })
  const area = `M${points.join('L')}L${w},${h}L0,${h}Z`
  const line = `M${points.join('L')}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace('#','')})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WeekBarChart({ weekSales, dark }) {
  const DAYS = [
    { label: 'Lun', key: 2 }, { label: 'Mar', key: 3 }, { label: 'Mié', key: 4 },
    { label: 'Jue', key: 5 }, { label: 'Vie', key: 6 }, { label: 'Sáb', key: 7 }, { label: 'Dom', key: 1 },
  ]
  const vals = DAYS.map((d) => Number(weekSales[d.key] || 0))
  const max = Math.max(...vals, 1)
  const today = new Date().getDay()
  const todayIdx = today === 0 ? 6 : today - 1
  const MAX_PX = 96

  return (
    <div className="flex items-end gap-1.5 mt-2" style={{ height: MAX_PX + 28 }}>
      {DAYS.map((d, i) => {
        const val = vals[i]
        const barPx = val > 0 ? Math.max(Math.round((val / max) * MAX_PX), 14) : 4
        const isToday = i === todayIdx
        return (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-1 group relative" style={{ height: MAX_PX + 20 }}>
            {val > 0 && (
              <div className={`absolute text-[10px] px-1.5 py-0.5 rounded ${dark ? 'bg-gray-600' : 'bg-gray-800'} text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10`}
                style={{ bottom: barPx + 24, left: '50%', transform: 'translateX(-50%)' }}>
                S/{val.toFixed(0)}
              </div>
            )}
            <div className="flex-1 flex items-end w-full">
              <div
                className={`w-full rounded-t-md transition-all duration-700 ${
                  val === 0
                    ? dark ? 'bg-gray-700' : 'bg-gray-200'
                    : isToday ? 'bg-brand-600' : 'bg-brand-400 group-hover:bg-brand-500'
                }`}
                style={{ height: `${barPx}px` }}
              />
            </div>
            <span className={`text-[10px] mt-1 ${isToday ? 'font-bold text-brand-400' : `font-medium ${dark ? 'text-gray-500' : 'text-gray-400'}`}`}>
              {d.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function DonutChart({ data, dark }) {
  const entries = Object.entries(data || {}).filter(([, v]) => v > 0)
  const total = entries.reduce((s, [, v]) => s + Number(v), 0)
  if (total === 0) return <div className={`flex items-center justify-center h-32 text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Sin pedidos</div>

  const r = 50
  const cx = 60
  const cy = 60
  let angle = -90

  const slices = entries.map(([status, count]) => {
    const pct = Number(count) / total
    const startAngle = angle
    angle += pct * 360
    const endAngle = angle
    const toRad = (a) => (a * Math.PI) / 180
    const x1 = cx + r * Math.cos(toRad(startAngle))
    const y1 = cy + r * Math.sin(toRad(startAngle))
    const x2 = cx + r * Math.cos(toRad(endAngle))
    const y2 = cy + r * Math.sin(toRad(endAngle))
    const large = pct > 0.5 ? 1 : 0
    return { status, count, pct, path: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z` }
  })

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 120 120" className="w-24 h-24 shrink-0">
        {slices.map((s) => (
          <path key={s.status} d={s.path} fill={STATUS_COLORS[s.status] || '#94a3b8'} opacity="0.9" />
        ))}
        <circle cx={cx} cy={cy} r="28" fill={dark ? 'rgb(31 41 55)' : 'white'} />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="700" fill="#a78bfa">{total}</text>
      </svg>
      <div className="space-y-1.5 flex-1 min-w-0">
        {slices.map((s) => (
          <div key={s.status} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: STATUS_COLORS[s.status] }} />
            <span className={`text-xs truncate flex-1 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{STATUS_LABELS[s.status]}</span>
            <span className={`text-xs font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TopProductsChart({ products, dark }) {
  if (!products?.length) return <p className="text-sm text-gray-400 text-center py-6">Sin ventas aún</p>
  const maxRev = Math.max(...products.map((p) => Number(p.revenue)), 1)
  return (
    <div className="space-y-3">
      {products.map((p, i) => {
        const pct = (Number(p.revenue) / maxRev) * 100
        return (
          <div key={p.product_name}>
            <div className="flex justify-between text-xs mb-1">
              <span className={`font-medium truncate mr-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{p.product_name}</span>
              <span className={`shrink-0 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                {p.qty} und · <span className={`font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>S/{Number(p.revenue).toFixed(0)}</span>
              </span>
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: `hsl(${260 - i * 20}, 70%, ${55 + i * 5}%)` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function DashboardPage() {
  const { theme } = useThemeStore()
  const dark = theme === 'dark'

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/admin/dashboard').then((r) => r.data),
    staleTime: 25000,
    refetchInterval: 30000,
  })

  const KPIs = [
    { label: 'Ventas hoy', value: `S/ ${Number(data?.today_sales || 0).toFixed(2)}`, icon: TrendingUp, color: 'text-green-600 bg-green-50', border: 'border-green-100' },
    { label: 'Pedidos hoy', value: data?.today_orders || 0, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50', border: 'border-blue-100' },
    { label: 'Ventas del mes', value: `S/ ${Number(data?.month_sales || 0).toFixed(2)}`, icon: DollarSign, color: 'text-brand-600 bg-brand-50', border: 'border-brand-100' },
    { label: 'En preparación', value: data?.pending_orders || 0, icon: Clock, color: 'text-orange-600 bg-orange-50', border: 'border-orange-100' },
    { label: 'En delivery', value: data?.on_way_orders || 0, icon: Truck, color: 'text-indigo-600 bg-indigo-50', border: 'border-indigo-100' },
    { label: 'Ingresos totales', value: `S/ ${Number(data?.total_revenue || 0).toFixed(2)}`, icon: TrendingUp, color: 'text-rose-600 bg-rose-50', border: 'border-rose-100' },
  ]

  const txt = dark ? 'text-white' : 'text-gray-900'
  const sub = dark ? 'text-gray-400' : 'text-gray-500'
  const muted = dark ? 'text-gray-500' : 'text-gray-400'
  const skeletonCls = dark ? 'bg-gray-700' : 'bg-gray-200'
  const dividerCls = dark ? 'divide-gray-700' : 'divide-gray-50'
  const borderCls = dark ? 'border-gray-700' : 'border-gray-100'
  const theadCls = dark ? 'bg-gray-700/50' : 'bg-gray-50'
  const hoverCls = dark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${txt}`}>Dashboard</h1>
        <p className={`${sub} text-sm`}>
          {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {KPIs.map(({ label, value, icon: Icon, color, border }) => (
          <div key={label} className={`card p-5 border ${border}`}>
            <div className="flex items-start justify-between mb-3">
              <p className={`text-sm ${sub}`}>{label}</p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
            </div>
            {isLoading
              ? <div className={`h-8 ${skeletonCls} animate-pulse rounded w-2/3`} />
              : <p className={`text-2xl font-extrabold ${txt}`}>{value}</p>}
          </div>
        ))}
      </div>

      {/* Sparkline 30 días + Ventas semana */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="card p-5 col-span-2">
          <div className="flex items-center justify-between mb-1">
            <h2 className={`font-bold ${txt} text-sm`}>Tendencia — últimos 30 días</h2>
            <span className={`text-xs ${muted}`}>{data?.last_30_days?.length || 0} días con ventas</span>
          </div>
          <p className={`text-xs ${muted} mb-3`}>Ingresos diarios (sin cancelados)</p>
          <Sparkline data={data?.last_30_days || []} height={80} />
        </div>

        <div className="card p-5">
          <h2 className={`font-bold ${txt} text-sm mb-1`}>Ventas esta semana</h2>
          <p className={`text-xs ${muted} mb-3`}>Barras por día — morado = hoy</p>
          <WeekBarChart weekSales={data?.week_sales || {}} dark={dark} />
        </div>
      </div>

      {/* Estado pedidos + Top productos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="card p-5">
          <h2 className={`font-bold ${txt} text-sm mb-4`}>Pedidos por estado</h2>
          <DonutChart data={data?.orders_by_status || {}} dark={dark} />
        </div>

        <div className="card p-5 col-span-2">
          <h2 className={`font-bold ${txt} text-sm mb-4`}>Top productos por ingresos</h2>
          <TopProductsChart products={data?.top_products || []} dark={dark} />
        </div>
      </div>

      {/* Pedidos recientes + Stock bajo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card col-span-2 overflow-hidden">
          <div className={`p-4 border-b ${borderCls} flex items-center justify-between`}>
            <h2 className={`font-bold ${txt} text-sm`}>Pedidos recientes</h2>
            <span className={`text-xs ${muted}`}>Últimos 10</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={`${theadCls} border-b ${borderCls}`}>
                <tr className={`text-xs ${sub} text-left`}>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${dividerCls}`}>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}><td colSpan={4} className="px-4 py-3"><div className={`h-4 ${skeletonCls} animate-pulse rounded`} /></td></tr>
                    ))
                  : (data?.recent_orders || []).length === 0
                    ? <tr><td colSpan={4} className={`px-4 py-8 text-center text-sm ${muted}`}>No hay pedidos aún</td></tr>
                    : (data?.recent_orders || []).map((o) => (
                        <tr key={o.id} className={`${hoverCls} transition-colors`}>
                          <td className={`px-4 py-3 font-mono text-xs ${sub}`}>{o.order_number}</td>
                          <td className={`px-4 py-3 text-xs ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{o.customer_name}</td>
                          <td className={`px-4 py-3 font-bold ${txt} text-xs`}>S/ {Number(o.total).toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <span className={`badge text-xs ${STATUS_BADGES[o.status]}`}>{STATUS_LABELS[o.status]}</span>
                          </td>
                        </tr>
                      ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-5">
          <h2 className={`font-bold ${txt} text-sm mb-4 flex items-center gap-2`}>
            <AlertTriangle size={16} className="text-orange-500" />
            Stock bajo
          </h2>
          <div className="space-y-3">
            {(data?.low_stock || []).map((p) => (
              <div key={p.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs truncate mr-2 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{p.name}</span>
                  <span className={`badge text-xs ${p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    {p.stock === 0 ? 'Agotado' : `${p.stock} und.`}
                  </span>
                </div>
                <div className={`h-1.5 rounded-full overflow-hidden ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`h-full rounded-full ${p.stock === 0 ? 'bg-red-400' : 'bg-orange-400'}`} style={{ width: `${Math.min((p.stock / 5) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
            {(!data?.low_stock || data.low_stock.length === 0) && (
              <p className={`text-sm ${muted} text-center py-4`}>Sin alertas de stock</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
