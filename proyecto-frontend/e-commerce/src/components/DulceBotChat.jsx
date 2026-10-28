import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, Send, CakeSlice, ShoppingBag, LogIn, UserPlus,
  RefreshCw, Image as ImageIcon, ChevronRight, CheckCircle2,
  Info, X, Heart, User, Paperclip, Camera
} from 'lucide-react'
import { sendChatMessage, getActiveGeminiKey } from '../lib/geminiService'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'
import toast from 'react-hot-toast'

export default function DulceBotChat({ onCakeUpdate, isFloating = false, onClose }) {
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const user = useAuthStore((s) => s.user)

  // API Key cargada automáticamente desde el entorno
  const [apiKey] = useState(getActiveGeminiKey())

  // Auth gate modal
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [lastAddedCake, setLastAddedCake] = useState(null)

  // Mensajes del chat
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: '¡Hola! 🎂 Bienvenido a Dulce Gusto.\n\nSoy DulceBot, tu asesor pastelero virtual.\n\n¿Para qué ocasión especial la necesitas hoy? (O sube una foto con el clip o cámara 📸)',
      suggestions: [
        'Cumpleaños 🎈',
        'Boda o Aniversario 💍',
        'Fiesta Infantil 🧸',
        'Graduación 🎓',
        'Para 20 personas 👥',
      ],
      cake_details: null,
      imageUrl: null,
    },
  ])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [attachedPhoto, setAttachedPhoto] = useState(null)

  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const [currentCake, setCurrentCake] = useState({
    name: 'Torta de Ensueño',
    occasion: 'Celebración',
    portions: 15,
    tiers: 1,
    sponge: 'Por definir',
    filling: 'Por definir',
    frosting: 'Por definir',
    style_description: 'Diseño artesanal',
    message: '¡Feliz Día!',
    estimated_price: 85.0,
    ready_to_order: false,
    image_prompt: '',
  })
  const [currentImageUrl, setCurrentImageUrl] = useState(
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80'
  )

  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Notificar al componente padre sobre cambios en la torta
  useEffect(() => {
    onCakeUpdate?.({
      cake: currentCake,
      imageUrl: currentImageUrl,
    })
  }, [currentCake, currentImageUrl, onCakeUpdate])

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 8 * 1024 * 1024) {
      toast.error('La foto no debe superar los 8MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setAttachedPhoto({
        dataUrl: event.target.result,
        name: file.name,
      })
      toast.success('Foto de referencia lista para enviar 📸')
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleSend = async (textToSend) => {
    const rawText = (textToSend || input).trim()
    const currentPhoto = attachedPhoto
    if ((!rawText && !currentPhoto) || loading) return

    setInput('')
    setAttachedPhoto(null)

    // Texto final del usuario
    const displayText = rawText || 'Te comparto esta foto de referencia para diseñar mi torta 🎂'
    const promptForAI = currentPhoto
      ? `${displayText} [El cliente adjuntó una foto de referencia de su torta soñada]`
      : displayText

    // Agregar mensaje del usuario con foto si la hay
    const updatedMessages = [
      ...messages,
      {
        role: 'user',
        text: displayText,
        userImage: currentPhoto?.dataUrl || null,
      },
    ]

    setMessages(updatedMessages)
    setLoading(true)

    try {
      const startTime = Date.now()
      // Enviar historial con el prompt para IA
      const messagesForAI = [...messages, { role: 'user', text: promptForAI }]
      const response = await sendChatMessage(messagesForAI, apiKey)

      // Garantizar exactamente 5 segundos de espera para que la animación de 3 puntitos sea visible y reflexiva
      const elapsed = Date.now() - startTime
      const minDelay = 5000 // 5 segundos
      if (elapsed < minDelay) {
        await new Promise((resolve) => setTimeout(resolve, minDelay - elapsed))
      }

      // Actualizar detalles si vinieron de la IA
      if (response.cake_details) {
        setCurrentCake((prev) => ({
          ...prev,
          ...response.cake_details,
        }))
      }

      if (response.imageUrl) {
        setCurrentImageUrl(response.imageUrl)
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: response.reply,
          suggestions: response.suggestions || [],
          cake_details: response.cake_details,
          imageUrl: response.imageUrl,
        },
      ])
    } catch (err) {
      console.error(err)
      toast.error('Hubo un pequeño inconveniente. Intentémoslo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // Flujo de agregar al carrito y comprar
  const handleAddToCartAndCheckout = (cakeToOrder, imgToOrder) => {
    const cake = cakeToOrder || currentCake
    const img = imgToOrder || currentImageUrl

    const customProduct = {
      id: `custom-cake-${Date.now()}`,
      name: cake.name || 'Torta Personalizada Dulce Gusto',
      price: Number(cake.estimated_price) || 95.0,
      image: img,
      description: `Personalizada con IA: Bizcocho ${cake.sponge || 'Artesanal'}, relleno de ${cake.filling || 'de la casa'}, cobertura ${cake.frosting || 'artesanal'}. Dedicatoria: "${cake.message || ''}"`,
      category: { name: 'Tortas Personalizadas IA' },
      stock: 50,
    }

    // Agregar al store Zustand (guarda en localStorage)
    addItem(
      customProduct,
      1,
      `${cake.portions || 15} porciones (${cake.tiers || 1} piso${cake.tiers > 1 ? 's' : ''})`,
      cake.message || 'Personalizado con DulceBot IA'
    )

    toast.success('¡Torta personalizada agregada al carrito!')

    // Validar si el usuario ya inició sesión
    if (user) {
      navigate('/checkout')
    } else {
      setLastAddedCake(cake)
      setShowAuthModal(true)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-xl border border-[#f0e4d8] overflow-hidden relative">
      {/* ── Encabezado del Chat ── */}
      <div className="px-5 py-4 bg-gradient-to-r from-gray-900 via-gray-900 to-brand-950 text-white flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 bg-gradient-to-tr from-brand-500 to-amber-400 rounded-2xl flex items-center justify-center shadow-lg p-0.5">
              <div className="w-full h-full bg-gray-900 rounded-[14px] flex items-center justify-center">
                <CakeSlice size={20} className="text-brand-400" />
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-gray-900 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">DulceBot</h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full border border-brand-500/30">
                <Sparkles size={11} className="text-brand-400" /> Pastry IA
              </span>
            </div>
            <p className="text-xs text-gray-400">Diseñador de tortas personalizadas</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isFloating && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* ── Cuerpo de Mensajes ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gradient-to-b from-amber-50/40 via-white to-white">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`flex items-end gap-2.5 max-w-[92%] sm:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar de perfil */}
              {msg.role === 'model' ? (
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-brand-500 via-pink-500 to-amber-300 p-0.5 shrink-0 shadow-sm mb-1">
                  <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-brand-600">
                    <CakeSlice size={15} />
                  </div>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm mb-1">
                  {user?.name ? user.name[0].toUpperCase() : <User size={14} />}
                </div>
              )}

              {/* Mensajes */}
              {msg.role === 'user' ? (
                <div className="rounded-2xl px-4 py-3.5 text-sm leading-relaxed shadow-sm bg-gray-900 text-white rounded-br-xs flex-1">
                  {/* Si el cliente subió una foto de referencia */}
                  {msg.userImage && (
                    <div className="mb-2.5 rounded-xl overflow-hidden max-w-[240px] border border-white/20 shadow-md">
                      <img src={msg.userImage} alt="Referencia" className="w-full h-36 object-cover" />
                      <div className="bg-black/60 px-2 py-1 text-[11px] text-white flex items-center gap-1">
                        <Camera size={12} className="text-amber-300" /> Foto de referencia adjunta
                      </div>
                    </div>
                  )}
                  <p className="text-white font-medium leading-relaxed">{msg.text}</p>
                </div>
              ) : (
                <div className="flex-1 space-y-2">
                  {/* Mensajes divididos del bot en múltiples burbujas */}
                  {msg.text.split('\n\n').filter(Boolean).map((paragraph, pIdx, arr) => {
                    const isQuestion = paragraph.includes('?')
                    const isLast = pIdx === arr.length - 1

                    return (
                      <div
                        key={pIdx}
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                          isQuestion && isLast
                            ? 'bg-amber-50/90 border border-amber-200/90 text-amber-950 font-medium rounded-bl-xs'
                            : 'bg-white border border-[#f0e4d8] text-gray-800 rounded-bl-xs'
                        }`}
                      >
                        <p>{paragraph}</p>
                      </div>
                    )
                  })}

                  {/* Foto adaptada según la personalización elegida */}
                  {msg.imageUrl && (
                    <div className="rounded-2xl overflow-hidden border border-amber-200/70 shadow-md bg-white p-1.5">
                      <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100 relative group">
                        <img
                          src={msg.imageUrl}
                          alt={msg.cake_details?.name || 'Torta Personalizada'}
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80'
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent absolute bottom-0 left-0 right-0 text-white text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold truncate text-sm">
                              {msg.cake_details?.sponge || msg.cake_details?.name || 'Torta Personalizada'}
                            </span>
                            <span className="bg-brand-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                              S/ {Number(msg.cake_details?.estimated_price || 95).toFixed(2)}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-300 mt-0.5 truncate">
                            {msg.cake_details?.filling ? `Relleno: ${msg.cake_details.filling}` : 'Personalizada según tu elección'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tarjeta de Resumen con botón de compra en el chat */}
                  {msg.cake_details?.ready_to_order && (
                    <div className="p-3.5 bg-gradient-to-br from-brand-50 to-pink-50 border border-brand-200 rounded-xl space-y-2">
                      <div className="flex items-center gap-1.5 text-brand-700 font-bold text-xs uppercase tracking-wide">
                        <CheckCircle2 size={14} className="text-brand-600" />
                        ¡Torta lista para preparar!
                      </div>
                      <div className="text-xs text-gray-700 space-y-1">
                        <p>
                          <strong>Porciones:</strong> {msg.cake_details.portions} personas (
                          {msg.cake_details.tiers} piso{msg.cake_details.tiers > 1 ? 's' : ''})
                        </p>
                        <p>
                          <strong>Sabor:</strong> {msg.cake_details.sponge}
                        </p>
                        <p>
                          <strong>Relleno:</strong> {msg.cake_details.filling}
                        </p>
                        {msg.cake_details.message && (
                          <p>
                            <strong>Dedicatoria:</strong> "{msg.cake_details.message}"
                          </p>
                        )}
                      </div>
                      <div className="pt-2 border-t border-brand-200/60 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-gray-500 block">Total estimado</span>
                          <span className="text-base font-extrabold text-brand-700">
                            S/ {Number(msg.cake_details.estimated_price).toFixed(2)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleAddToCartAndCheckout(msg.cake_details, msg.imageUrl)}
                          className="btn-primary text-xs px-4 py-2 shadow-md shadow-brand-500/20"
                        >
                          <ShoppingBag size={14} />
                          Pedir ahora
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sugerencias Rápidas (Pills) alineadas con la burbuja */}
            {msg.role === 'model' &&
              idx === messages.length - 1 &&
              msg.suggestions?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5 pl-10.5 max-w-[95%]">
                  {msg.suggestions.map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleSend(sug)}
                      disabled={loading}
                      className="bg-white hover:bg-brand-50 text-gray-700 hover:text-brand-700 border border-[#f0e4d8] hover:border-brand-300 text-xs px-3 py-1.5 rounded-full font-medium shadow-xs transition-all duration-200 active:scale-95"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
          </div>
        ))}

        {/* Indicador de escritura animado con avatar y 3 puntitos */}
        {loading && (
          <div className="flex items-end gap-2.5 animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-brand-500 via-pink-500 to-amber-300 p-0.5 shrink-0 shadow-sm mb-1">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-brand-600">
                <CakeSlice size={15} />
              </div>
            </div>
            <div className="bg-white border border-[#f0e4d8] text-gray-600 rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs flex items-center gap-2.5 text-xs">
              <div className="flex items-center gap-1.5 py-0.5">
                <div className="w-2.5 h-2.5 bg-brand-500 rounded-full animate-bounce" />
                <div
                  className="w-2.5 h-2.5 bg-brand-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.15s' }}
                />
                <div
                  className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.3s' }}
                />
              </div>
              <span className="text-gray-400 text-xs font-medium">
                DulceBot está horneando una respuesta...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Vista Previa de Foto Adjunta (si hay) ── */}
      {attachedPhoto && (
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-200/60 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5 text-xs text-amber-950 font-medium">
            <img
              src={attachedPhoto.dataUrl}
              alt="Preview"
              className="w-10 h-10 object-cover rounded-xl border border-amber-300 shadow-xs"
            />
            <div>
              <span className="font-bold block truncate max-w-[200px]">
                {attachedPhoto.name || 'Foto de referencia'}
              </span>
              <span className="text-[10px] text-amber-700 font-normal">
                Se enviará a DulceBot con tu mensaje
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAttachedPhoto(null)}
            className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-white transition-colors"
            title="Quitar foto"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Barra de Input con Clip y Cámara ── */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
        className="p-3 sm:p-4 bg-white border-t border-gray-100 flex items-center gap-2"
      >
        {/* Inputs ocultos de archivo */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoSelect}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhotoSelect}
        />

        {/* Botón Clip para subir foto */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          title="Adjuntar foto de referencia (Clip)"
          className="p-2.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors disabled:opacity-40 shrink-0"
        >
          <Paperclip size={19} />
        </button>

        {/* Botón Cámara */}
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={loading}
          title="Tomar foto con la cámara"
          className="p-2.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors disabled:opacity-40 shrink-0"
        >
          <Camera size={19} />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={attachedPhoto ? 'Agrega un mensaje o envía la foto...' : 'Escribe tu idea o sube una foto...'}
          className="flex-1 input bg-gray-50 focus:bg-white text-sm py-2.5"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading || (!input.trim() && !attachedPhoto)}
          className="btn-primary p-2.5 sm:px-4 rounded-xl disabled:opacity-40 shrink-0 shadow-md shadow-brand-500/20"
        >
          <Send size={18} />
          <span className="hidden sm:inline">Enviar</span>
        </button>
      </form>

      {/* ── Modal de Autenticación Intermedia (Login / Registro) ── */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 text-center relative overflow-hidden">
            <div className="w-16 h-16 bg-gradient-to-tr from-brand-100 to-pink-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CakeSlice size={32} />
            </div>

            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
              ¡Tu torta está en el carrito! 🎂
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
                <LogIn size={18} />
                Ya tengo cuenta — Iniciar Sesión
              </button>

              <button
                onClick={() => navigate('/registro?redirect=/checkout')}
                className="btn-secondary w-full btn-lg justify-center border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
              >
                <UserPlus size={18} />
                Soy nuevo — Crear una Cuenta
              </button>
            </div>

            <button
              onClick={() => setShowAuthModal(false)}
              className="text-xs text-gray-400 hover:text-gray-600 mt-5 block mx-auto underline"
            >
              Seguir navegando en la tienda
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
