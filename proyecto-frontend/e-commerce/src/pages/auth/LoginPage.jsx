import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { CakeSlice, Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const { login, loading } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const user = await login(email, password)
      toast.success(`Bienvenido, ${user.name}`)
      navigate(user.role === 'admin' ? '/admin' : redirect)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Credenciales incorrectas.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl mb-4">
            <CakeSlice size={26} className="text-white" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Dulce Gusto</h1>
          <p className="text-gray-400 text-sm mt-1">Iniciá sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full btn-lg">
            <LogIn size={18} />
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-4">
          ¿No tenés cuenta?{' '}
          <Link to="/registro" className="text-brand-400 hover:text-brand-300 font-medium">
            Registrate gratis
          </Link>
        </p>
        <p className="text-center mt-2">
          <Link to="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">← Volver a la tienda</Link>
        </p>
      </div>
    </div>
  )
}
