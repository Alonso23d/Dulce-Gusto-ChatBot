import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Sparkles, X, Maximize2, CakeSlice, MessageCircleHeart } from 'lucide-react'
import DulceBotChat from './DulceBotChat'

export default function DulceBotWidget() {
  const [open, setOpen] = useState(false)
  const [showBubble, setShowBubble] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  // No mostrar el widget si ya estamos en la página del estudio de personalización
  if (location.pathname === '/personalizar') {
    return null
  }

  return (
    <div className="z-50">
      {/* ── Ventana Emergente del Chatbot (Posicionada abajo a la derecha) ── */}
      {open && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[410px] h-[550px] max-h-[calc(100vh-6rem)] z-50 shadow-2xl rounded-3xl overflow-hidden border border-[#f0e4d8] bg-white flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Barra de control superior para expandir a pantalla completa */}
          <div className="bg-gray-900 px-4 py-2 flex items-center justify-between text-xs text-gray-300 border-b border-gray-800">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles size={13} className="text-amber-400" /> Asistente DulceBot
            </span>
            <button
              onClick={() => {
                setOpen(false)
                navigate('/personalizar')
              }}
              className="hover:text-white flex items-center gap-1.5 font-semibold text-xs text-brand-300 hover:text-brand-200 transition-colors"
            >
              <Maximize2 size={13} /> Pantalla completa
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            <DulceBotChat isFloating={true} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Botón Flotante Activo & Llamativo ── */}
      {!open && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end group">
          {/* ── Globo de Diálogo Flotante Llamativo (Speech Bubble) ── */}
          {showBubble && (
            <div className="mb-3 mr-1 bg-white/95 backdrop-blur-md text-gray-900 text-xs font-bold py-2 px-3.5 rounded-2xl shadow-xl border border-brand-200 flex items-center gap-2 animate-bounce cursor-pointer hover:bg-white transition-all select-none"
              onClick={() => setOpen(true)}
            >
              <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                <Sparkles size={11} />
              </div>
              <span>¿Tienes una fecha especial? <strong>¡Diseña tu torta aquí!</strong> 🎂</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowBubble(false)
                }}
                className="text-gray-400 hover:text-gray-600 ml-1 p-0.5 rounded-full"
                title="Cerrar mensaje"
              >
                <X size={12} />
              </button>
              {/* Puntero hacia abajo */}
              <div className="absolute -bottom-1.5 right-8 w-3 h-3 bg-white border-r border-b border-brand-200 transform rotate-45" />
            </div>
          )}

          {/* ── Botón Principal Grande y con Aura Brillante ── */}
          <button
            onClick={() => {
              setOpen(true)
              setShowBubble(false)
            }}
            className="relative flex items-center gap-3.5 bg-gradient-to-r from-[#2a073f] via-[#480d6b] to-[#751f9a] text-white pl-4 pr-6 py-4 rounded-full shadow-[0_10px_35px_rgba(117,31,154,0.45)] hover:shadow-[0_15px_45px_rgba(196,76,243,0.6)] border-2 border-brand-300/40 hover:border-brand-300 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden"
            title="Diseña tu torta con Inteligencia Artificial"
          >
            {/* Resplandor animado de fondo (glow ring) */}
            <span className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-amber-300 rounded-full blur-md opacity-35 group-hover:opacity-75 transition duration-500 group-hover:duration-200" />

            {/* Punto de luz ping animado */}
            <span className="absolute top-2.5 right-3 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400 border-2 border-purple-950" />
            </span>

            {/* Icono de Torta destacado */}
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-300 via-pink-400 to-brand-500 flex items-center justify-center text-gray-950 shadow-md transform group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300 shrink-0">
              <CakeSlice size={24} className="text-gray-950" />
            </div>

            {/* Textos Grandes y Claros */}
            <div className="relative text-left pr-1">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-amber-200 transition-colors">
                  Pide con IA
                </span>
                <span className="inline-flex items-center gap-0.5 bg-amber-400/20 text-amber-300 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border border-amber-400/30 uppercase tracking-wider">
                  <Sparkles size={9} /> Nuevo
                </span>
              </div>
              <span className="block text-xs text-purple-200 font-medium leading-tight mt-0.5">
                Personaliza tu torta en minutos ✨
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
