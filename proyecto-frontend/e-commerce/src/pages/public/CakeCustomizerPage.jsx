import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles, Cake, ShoppingBag, Star, ShieldCheck, Truck,
  CheckCircle, ArrowLeft, Heart, Eye, RefreshCw
} from 'lucide-react'
import DulceBotChat from '../../components/DulceBotChat'
import { useCartStore } from '../../store/useCartStore'
import { useAuthStore } from '../../store/useAuthStore'
import toast from 'react-hot-toast'

export default function CakeCustomizerPage() {
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const user = useAuthStore((s) => s.user)

  const [activeTab, setActiveTab] = useState('chat') // 'chat' o 'preview' en móviles
  const [cakeData, setCakeData] = useState({
    cake: {
      name: 'Torta de Ensueño Dulce Gusto',
      occasion: 'Celebración',
      portions: 15,
      tiers: 1,
      sponge: 'Chocolate Fudge',
      filling: 'Manjar blanco de olla',
      frosting: 'Ganache de chocolate brillante',
      style_description: 'Elegante con frutos frescos',
      message: '¡Feliz Día!',
      estimated_price: 85.0,
      ready_to_order: false,
    },
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
  })

  const [showAuthModal, setShowAuthModal] = useState(false)

  const cake = cakeData.cake
  const imageUrl = cakeData.imageUrl

  const handleOrder = () => {
    const customProduct = {
      id: `custom-cake-${Date.now()}`,
      name: cake.name || 'Torta Personalizada Dulce Gusto',
      price: Number(cake.estimated_price) || 95.0,
      image: imageUrl,
      description: `Personalizada con IA: Bizcocho ${cake.sponge || 'Artesanal'}, relleno de ${cake.filling || 'de la casa'}, cobertura ${cake.frosting || 'artesanal'}. Dedicatoria: "${cake.message || ''}"`,
      category: { name: 'Tortas Personalizadas' },
      stock: 50,
    }

    addItem(
      customProduct,
      1,
      `${cake.portions || 15} porciones (${cake.tiers || 1} piso${cake.tiers > 1 ? 's' : ''})`,
      cake.message || 'Personalizado con IA'
    )

    toast.success('¡Torta agregada al carrito!')

    if (user) {
      navigate('/checkout')
    } else {
      setShowAuthModal(true)
    }
  }

  return (
    <div className="bg-[#fcf8f2] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* ── Breadcrumb & Encabezado ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-2 transition-colors"
            >
              <ArrowLeft size={14} /> Volver al catálogo
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Estudio de Creación <span className="text-[#a67c00]">con IA</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold bg-[#f6eaff] text-[#9333ea] px-3 py-1 rounded-full border border-purple-200">
                <Sparkles size={13} /> DulceBot 2.0
              </span>
            </div>
            <p className="text-gray-600 text-sm mt-1">
              Conversa con nuestro maestro pastelero virtual para diseñar y cotizar tu torta única en minutos.
            </p>
          </div>

          {/* Toggle en móviles */}
          <div className="flex lg:hidden bg-white rounded-xl p-1 border border-gray-200 shadow-xs">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'chat' ? 'bg-gray-900 text-white shadow-xs' : 'text-gray-600'
              }`}
            >
              💬 Chatbot Asesor
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'preview' ? 'bg-brand-600 text-white shadow-xs' : 'text-gray-600'
              }`}
            >
              🎂 Vista Previa
            </button>
          </div>
        </div>

        {/* ── Layout Principal Dual ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LADO IZQUIERDO: Chatbot Asesor (7 columnas) */}
          <div
            className={`lg:col-span-7 h-[700px] sm:h-[750px] ${
              activeTab === 'chat' ? 'block' : 'hidden lg:block'
            }`}
          >
            <DulceBotChat onCakeUpdate={setCakeData} />
          </div>

          {/* LADO DERECHO: Tarjeta Viva de Creación (5 columnas) */}
          <div
            className={`lg:col-span-5 space-y-6 ${
              activeTab === 'preview' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-[#f0e4d8] sticky top-24">
              {/* Header de la tarjeta */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-[#a67c00]">
                    <Cake size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-base leading-tight">
                      Tu Torta en Tiempo Real
                    </h2>
                    <p className="text-xs text-gray-400">Generada por DulceBot IA</p>
                  </div>
                </div>

                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    cake.ready_to_order
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {cake.ready_to_order ? '✨ Diseño Completo' : '✏️ Personalizando...'}
                </span>
              </div>

              {/* Imagen fotorrealista generada */}
              <div className="mt-4 relative rounded-2xl overflow-hidden aspect-square bg-gradient-to-br from-amber-50 to-pink-50 border border-gray-100 shadow-inner group">
                <img
                  src={imageUrl}
                  alt={cake.name}
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80'
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Placa de Dedicatoria Virtual en la base */}
                {cake.message && (
                  <div className="absolute bottom-3 left-3 right-3 bg-gradient-to-r from-amber-900/90 to-yellow-950/90 text-amber-100 text-xs py-2 px-3.5 rounded-xl backdrop-blur-xs border border-amber-500/30 shadow-lg text-center font-serif italic">
                    <span className="block text-[10px] uppercase font-sans tracking-widest text-amber-400 font-semibold mb-0.5">
                      Dedicatoria en Placa de Chocolate
                    </span>
                    "{cake.message}"
                  </div>
                )}
              </div>

              {/* Ficha de Ingredientes y Detalles */}
              <div className="mt-5 space-y-3">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-extrabold text-lg text-gray-900">{cake.name}</h3>
                  <span className="text-2xl font-black text-brand-700">
                    S/ {Number(cake.estimated_price).toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                      Porciones & Pisos
                    </span>
                    <span className="font-bold text-gray-800">
                      {cake.portions} personas · {cake.tiers} piso{cake.tiers > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                      Bizcochuelo
                    </span>
                    <span className="font-bold text-gray-800 truncate block">
                      {cake.sponge || 'Artesanal'}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                      Relleno
                    </span>
                    <span className="font-bold text-gray-800 truncate block">
                      {cake.filling || 'De la casa'}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                      Cobertura
                    </span>
                    <span className="font-bold text-gray-800 truncate block">
                      {cake.frosting || 'Especial'}
                    </span>
                  </div>
                </div>

                {cake.style_description && (
                  <p className="text-xs text-gray-500 italic bg-[#fdf2e2] p-2.5 rounded-xl border border-[#f0e4d8]">
                    🎨 <strong>Estilo:</strong> {cake.style_description}
                  </p>
                )}
              </div>

              {/* Botón de Agregar y Checkout */}
              <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
                <button
                  onClick={handleOrder}
                  className="btn-primary w-full btn-lg justify-center shadow-lg shadow-brand-500/25"
                >
                  <ShoppingBag size={20} />
                  Pedir esta Torta
                </button>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500 pt-1">
                  <div className="flex items-center gap-1.5 justify-center">
                    <Truck size={14} className="text-brand-600" />
                    Delivery en Lima
                  </div>
                  <div className="flex items-center gap-1.5 justify-center">
                    <ShieldCheck size={14} className="text-brand-600" />
                    Ingredientes 100% frescos
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal de Autenticación si no está logueado ── */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 text-center">
            <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Cake size={32} />
            </div>

            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
              ¡Tu torta personalizada está lista! 🎂
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Para coordinar el delivery a tu dirección y confirmar tu pedido a tu nombre, por favor
              ingresa a tu cuenta o regístrate en solo un minuto:
            </p>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/login?redirect=/checkout')}
                className="btn-primary w-full btn-lg justify-center shadow-lg shadow-brand-500/20"
              >
                Ya tengo cuenta — Iniciar Sesión
              </button>

              <button
                onClick={() => navigate('/registro?redirect=/checkout')}
                className="btn-secondary w-full btn-lg justify-center border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
              >
                Soy nuevo — Crear una Cuenta
              </button>
            </div>

            <button
              onClick={() => setShowAuthModal(false)}
              className="text-xs text-gray-400 hover:text-gray-600 mt-5 block mx-auto underline"
            >
              Seguir explorando la tienda
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
