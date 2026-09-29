import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { CheckCircle, Smartphone, CreditCard, Banknote, Building2 } from 'lucide-react'
import api from '../../lib/api'
import { useCartStore } from '../../store/useCartStore'
import toast from 'react-hot-toast'

const STEPS = ['Datos', 'Entrega', 'Pago']
const PAYMENT_METHODS = [
  { id: 'yape', label: 'Yape', icon: Smartphone },
  { id: 'plin', label: 'Plin', icon: Smartphone },
  { id: 'visa', label: 'Visa/MC', icon: CreditCard },
  { id: 'bcp', label: 'BCP', icon: Building2 },
  { id: 'transfer', label: 'Transferencia', icon: Building2 },
  { id: 'cash', label: 'Efectivo', icon: Banknote },
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, total, clear } = useCartStore()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    customer_name: '', customer_email: '', customer_phone: '',
    district: '', address: '', address_reference: '',
    delivery_date: '', delivery_time: '',
    payment_method: 'yape', notes: '',
  })

  const { data: zones = [] } = useQuery({
    queryKey: ['zones'],
    queryFn: () => api.get('/delivery/zones').then((r) => r.data),
    staleTime: Infinity,
  })

  const selectedZone = zones?.find((z) => z.district === form.district)
  const subtotal = total()
  const deliveryCost = Number(selectedZone?.delivery_cost) || 15
  const orderTotal = subtotal + deliveryCost

  const mutation = useMutation({
    mutationFn: (data) => api.post('/orders', data),
    onSuccess: ({ data: order }) => {
      clear()
      toast.success('¡Pedido realizado con éxito!')
      navigate(`/seguimiento/${order.order_number}`)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Error al procesar el pedido.')
    },
  })

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (step < 2) { setStep(step + 1); return }
    mutation.mutate({
      ...form,
      items: items.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
        size: i.size,
        customization: i.customization,
      })),
    })
  }

  if (items.length === 0) {
    navigate('/carrito')
    return null
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="section-title mb-8">Finalizar pedido</h1>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                i < step ? 'text-brand-600 cursor-pointer' : i === step ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                i < step ? 'bg-brand-600 border-brand-600 text-white' :
                i === step ? 'border-gray-900 text-gray-900' : 'border-gray-300 text-gray-400'
              }`}>
                {i < step ? <CheckCircle size={14} /> : i + 1}
              </span>
              {s}
            </button>
            {i < STEPS.length - 1 && <div className="w-8 h-0.5 bg-gray-200" />}
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <form onSubmit={handleSubmit} className="flex-1 card p-6">
          {/* Step 0: Contact */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-900 mb-4">Datos de contacto</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Nombre completo *</label>
                  <input className="input" required value={form.customer_name} onChange={(e) => setField('customer_name', e.target.value)} />
                </div>
                <div>
                  <label className="label">Teléfono *</label>
                  <input className="input" required type="tel" value={form.customer_phone} onChange={(e) => setField('customer_phone', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Email *</label>
                <input className="input" required type="email" value={form.customer_email} onChange={(e) => setField('customer_email', e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 1: Delivery */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-900 mb-4">Dirección de entrega</h2>
              <div>
                <label className="label">Distrito *</label>
                <select className="input" required value={form.district} onChange={(e) => setField('district', e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {(zones || []).map((z) => (
                    <option key={z.id} value={z.district}>
                      {z.district} — S/ {z.delivery_cost}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Dirección *</label>
                <input className="input" required value={form.address} onChange={(e) => setField('address', e.target.value)} placeholder="Av. Principal 123, Piso 2" />
              </div>
              <div>
                <label className="label">Referencia</label>
                <input className="input" value={form.address_reference} onChange={(e) => setField('address_reference', e.target.value)} placeholder="Cerca al parque..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Fecha de entrega *</label>
                  <input className="input" required type="date" value={form.delivery_date} min={new Date().toISOString().split('T')[0]} onChange={(e) => setField('delivery_date', e.target.value)} />
                </div>
                <div>
                  <label className="label">Hora preferida</label>
                  <select className="input" value={form.delivery_time} onChange={(e) => setField('delivery_time', e.target.value)}>
                    <option value="">Cualquier hora</option>
                    {['09:00 - 12:00', '12:00 - 15:00', '15:00 - 18:00', '18:00 - 21:00'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Notas adicionales</label>
                <textarea className="input resize-none h-20" value={form.notes} onChange={(e) => setField('notes', e.target.value)} placeholder="Ej: tocar el timbre 2 veces..." />
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-900 mb-4">Método de pago</h2>
              <div className="grid grid-cols-3 gap-3">
                {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setField('payment_method', id)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      form.payment_method === id
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={20} className="mx-auto mb-1" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
              {['yape', 'plin'].includes(form.payment_method) && (
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 border border-gray-200">
                  <p className="font-semibold mb-1">Número: 999 888 777</p>
                  <p>A nombre de: Dulce Gusto SAC</p>
                  <p className="mt-2 text-gray-400 text-xs">
                    Sube el voucher desde la página de seguimiento de tu pedido.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary flex-1">
                Atrás
              </button>
            )}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary flex-1 btn-lg"
            >
              {mutation.isPending ? 'Procesando...' : step < 2 ? 'Continuar' : 'Confirmar pedido'}
            </button>
          </div>
        </form>

        {/* Order summary */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="card p-4 sticky top-24">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Tu pedido</h3>
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.key} className="flex justify-between text-xs text-gray-600">
                  <span className="truncate mr-2">{item.product.name} x{item.quantity}</span>
                  <span className="shrink-0">S/ {(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span>S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery</span><span>S/ {deliveryCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-100">
                <span>Total</span><span>S/ {orderTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
