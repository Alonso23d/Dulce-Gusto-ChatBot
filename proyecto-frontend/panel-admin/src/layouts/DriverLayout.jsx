import { Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { LogOut, CakeSlice, Bike } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DriverLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      toast.error('Error al cerrar sesión')
    }
  }

  // Get user initials
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'R'

  return (
    <div className="min-h-screen bg-slate-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100/60 via-slate-50 to-slate-50 flex flex-col font-sans text-slate-800">
      {/* Mobile-friendly Header with Glassmorphism */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-brand-500 to-purple-600 text-white p-2 rounded-xl shadow-md">
              <CakeSlice size={20} />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-purple-700 hidden sm:block">
              Dulce Gusto Repartos
            </span>
          </div>

          <div className="flex items-center gap-4">
            
            {/* User Profile */}
            <div className="flex items-center gap-3 bg-white border border-slate-100 shadow-sm py-1.5 px-3 rounded-full">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.name}</p>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Repartidor</p>
              </div>
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-200 to-slate-300 flex items-center justify-center text-slate-700 font-bold text-sm border border-white shadow-sm">
                  {initials}
                </div>
                {/* Online Indicator */}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all hover:scale-105 active:scale-95"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 w-full max-w-5xl mx-auto overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

