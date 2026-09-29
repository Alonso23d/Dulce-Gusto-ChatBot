import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CakeSlice, Eye, EyeOff, UserPlus } from 'lucide-react'
import api from '../../lib/api'
import { useAuthStore } from '../../store/useAuthStore'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', password_confirmation: '',
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password_confirmation) {
      toast.error('Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      useAuthStore.setState({ user: data.user, token: data.token })
      toast.success(`Bienvenida, ${data.user.name}`)
      navigate('/')
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        Object.values(errors).flat().forEach((msg) => toast.error(msg))
      } else {
        toast.error(err.response?.data?.message || 'Error al registrarse.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl mb-4">
            <CakeSlice size={26} className="text-white" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
          <p className="text-gray-400 text-sm mt-1">Registrate para hacer tu pedido</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="label">Nombre completo *</label>
            <input className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="María García" />
          </div>
          <div>
            <label className="label">Email *</label>
            <input className="input" required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="maria@email.com" />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input className="input" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="999 888 777" />
          </div>
          <div>
            <label className="label">Contraseña *</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                required
                minLength={8}
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                className="input pr-10"
                placeholder="Mínimo 8 caracteres"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">Confirmar contraseña *</label>
            <input
              type="password"
              required
              value={form.password_confirmation}
              onChange={(e) => set('password_confirmation', e.target.value)}
              className="input"
              placeholder="Repetí la contraseña"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full btn-lg">
            <UserPlus size={18} />
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-4">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
