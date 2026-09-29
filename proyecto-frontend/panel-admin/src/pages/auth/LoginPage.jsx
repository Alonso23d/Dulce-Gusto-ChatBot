import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, CakeSlice } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const { login, loading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const user = await login(email, password)
      if (user.role !== 'admin' && user.role !== 'delivery') {
        toast.error('Acceso denegado. Se requiere cuenta de administrador o repartidor.')
        return
      }
      toast.success(`Bienvenido, ${user.name}`, { position: 'bottom-right' })
      if (user.role === 'delivery') {
        navigate('/repartidor')
      } else {
        navigate('/')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Credenciales incorrectas.')
    }
  }

  return (
    <div className="min-h-screen flex bg-[#130f11] text-gray-200 font-sans">
      
      {/* ── Panel Izquierdo (Formulario) ── */}
      <div className="w-full lg:w-[480px] xl:w-[500px] flex flex-col justify-between p-8 sm:p-12 relative z-10 shadow-2xl bg-[#130f11]">
        
        {/* Header / Logo Pequeño */}
        <div className="flex items-center gap-2 text-white mb-12">
           <CakeSlice size={28} className="text-[#9d4c76]" />
           <span className="font-extrabold text-2xl tracking-tight">Dulce Gusto</span>
        </div>

        {/* Formulario */}
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-2xl font-bold text-white mb-2">Iniciar sesión</h1>
          <p className="text-gray-400 text-sm mb-10">Ingresa tus credenciales para acceder al sistema.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1a1416] border border-[#2a2024] rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-[#7c3a5d] focus:ring-1 focus:ring-[#7c3a5d] transition-colors"
                placeholder="admin@dulcegusto.pe"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Contraseña
                </label>
                <button type="button" className="text-xs text-[#9d4c76] hover:text-[#b85a8b] font-medium">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1a1416] border border-[#2a2024] rounded-2xl pl-5 pr-12 py-3.5 text-white focus:outline-none focus:border-[#7c3a5d] focus:ring-1 focus:ring-[#7c3a5d] transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-[#652d4b] hover:bg-[#52233c] text-white font-bold rounded-full py-3.5 flex items-center justify-center gap-2 transition-all mt-8 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#652d4b]/30"
            >
              <LogIn size={20} />
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-gray-800/50 text-center">
             <p className="text-sm text-gray-500 font-medium">Sistema de Control de Ventas</p>
          </div>
        </div>

        {/* Footer Text */}
        <div className="mt-12 text-center text-xs text-gray-600 font-medium tracking-wide">
          <p>© 2026 Dulce Gusto - Sistema de Pastelería</p>
        </div>
      </div>

      {/* ── Panel Derecho (Banner Gráfico) ── */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#fcf5ec] to-[#f3e1cd] items-center justify-center overflow-hidden">
        
        {/* Efecto de textura de papel crema suave */}
        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

        {/* Contenido Central */}
        <div className="relative z-10 flex flex-col items-center text-center px-8 w-full">
          {/* Logo del cliente ampliado y perfectamente fusionado */}
          <div className="w-[28rem] h-[28rem] -mt-24 -mb-16 flex items-center justify-center relative">
            <img 
              src="/logo-dulce-gusto.png" 
              alt="Dulce Gusto Logo" 
              className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm scale-150" 
              style={{
                WebkitMaskImage: 'radial-gradient(circle closest-side, black 60%, transparent 95%)',
                maskImage: 'radial-gradient(circle closest-side, black 60%, transparent 95%)'
              }}
              onError={(e) => { 
                e.target.style.display = 'none'; 
                e.target.nextElementSibling.style.display = 'flex' 
              }} 
            />
            {/* Fallback si no carga la imagen */}
            <div className="hidden absolute inset-0 flex-col items-center justify-center text-[#652d4b]">
               <CakeSlice size={80} className="mb-2 text-[#652d4b]" />
               <span className="font-extrabold text-xl">Dulce Gusto</span>
            </div>
          </div>
          
          <h2 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-4 drop-shadow-sm">
            Sistema de Pastelería
          </h2>
          <p className="text-gray-700 text-lg max-w-md font-medium tracking-wide">
            Control total para tu negocio. Gestiona ventas, inventarios y clientes en un solo lugar.
          </p>
          
          {/* Badges tipo "Eless" reference */}
          <div className="flex gap-4 mt-10">
            {['Ventas', 'Inventario', 'Catálogo'].map((item) => (
              <div key={item} className="px-5 py-2 rounded-full bg-white border border-[#f0e4d8] text-gray-700 text-sm font-semibold shadow-sm hover:-translate-y-0.5 transition-transform">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
