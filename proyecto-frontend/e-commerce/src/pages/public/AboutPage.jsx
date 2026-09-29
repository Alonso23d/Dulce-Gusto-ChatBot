import { Link } from 'react-router-dom'
import { Heart, Award, Truck, Users, Store } from 'lucide-react'

export default function AboutPage() {
  const stats = [
    { icon: Users, value: '+500', label: 'Clientes felices' },
    { icon: Award, value: '+3 años', label: 'En el mercado' },
    { icon: Heart, value: '100%', label: 'Artesanal' },
    { icon: Truck, value: '15+', label: 'Distritos' },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-50 to-rose-50 py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white rounded-3xl rotate-3 flex items-center justify-center shadow-sm border border-brand-100">
              <Store size={40} className="text-brand-600 -rotate-3" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Nuestra historia</h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Dulce Gusto nació de la pasión por crear momentos especiales a través de la pastelería artesanal.
            Cada torta, cada cupcake, cada macaron es elaborado con amor y los mejores ingredientes.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-2 sm:grid-cols-4 gap-6">
        {stats.map(({ icon: Icon, value, label }) => (
          <div key={label} className="card p-6 text-center">
            <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Icon size={22} className="text-brand-600" />
            </div>
            <div className="text-2xl font-extrabold text-gray-900 mb-1">{value}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </section>

      {/* Our story */}
      <section className="max-w-5xl mx-auto px-4 pb-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Cómo funciona?</h2>
          <div className="space-y-4">
            {[
              { step: '01', title: 'Elige tu producto', desc: 'Navega por nuestro catálogo y selecciona el producto que más te guste.' },
              { step: '02', title: 'Personaliza', desc: 'Agrega el mensaje que deseas y el tamaño ideal para tu ocasión.' },
              { step: '03', title: 'Paga con seguridad', desc: 'Acepta Yape, Plin, tarjetas y transferencias bancarias.' },
              { step: '04', title: 'Recibe en casa', desc: 'Delivery express en todo Lima. Seguimiento en tiempo real.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                  {step}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{title}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl aspect-square overflow-hidden shadow-md">
          <img 
            src="/torta-about.jpg" 
            alt="Nuestra deliciosa torta" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      </section>

      <section className="bg-gray-950 py-16 text-center px-4">
        <h2 className="text-3xl font-bold text-white mb-4">¿Lista para pedir?</h2>
        <p className="text-gray-400 mb-8">Explora nuestro catálogo y encuentra el pastel perfecto.</p>
        <Link to="/catalogo" className="btn-primary btn-lg">
          Ver catálogo completo
        </Link>
      </section>
    </div>
  )
}
