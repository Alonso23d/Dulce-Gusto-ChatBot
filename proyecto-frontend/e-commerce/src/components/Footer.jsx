import { Link } from 'react-router-dom'
import { CakeSlice, Phone, MapPin, Mail, AtSign, Share2 } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-rose-500 rounded-lg flex items-center justify-center">
              <CakeSlice size={16} className="text-white" />
            </div>
            <span className="text-white font-bold">Dulce Gusto</span>
          </div>
          <p className="text-sm leading-relaxed mb-5">
            Pastelería artesanal con amor. Tortas, cupcakes y más para tus momentos especiales.
          </p>
          <div className="flex gap-3">
            <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-brand-600 rounded-lg flex items-center justify-center transition-colors">
              <AtSign size={15} className="text-gray-300" />
            </a>
            <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-brand-600 rounded-lg flex items-center justify-center transition-colors">
              <Share2 size={15} className="text-gray-300" />
            </a>
          </div>
        </div>

        {/* Tienda */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Tienda</h4>
          <ul className="space-y-2.5 text-sm">
            {[
              { label: 'Catálogo completo', to: '/catalogo' },
              { label: 'Tortas',            to: '/catalogo?category=tortas' },
              { label: 'Cupcakes',          to: '/catalogo?category=cupcakes' },
              { label: 'Macarons',          to: '/catalogo?category=macarons' },
              { label: 'Cheesecake',        to: '/catalogo?category=cheesecake' },
            ].map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="hover:text-white transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Información */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Información</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/nosotros"  className="hover:text-white transition-colors">Nuestra historia</Link></li>
            <li><Link to="/nosotros"  className="hover:text-white transition-colors">¿Cómo pedimos?</Link></li>
            <li><Link to="/seguimiento/:orderNumber" className="hover:text-white transition-colors">Rastrear pedido</Link></li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Contacto</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2"><Phone size={14} /><span>+51 999 888 777</span></li>
            <li className="flex items-center gap-2"><Mail size={14} /><span>hola@dulcegusto.pe</span></li>
            <li className="flex items-center gap-2"><MapPin size={14} /><span>Lima, Perú</span></li>
            <li className="flex items-center gap-2"><AtSign size={14} /><span>@dulcegusto.pe</span></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Dulce Gusto. Todos los derechos reservados.
          </p>
          <p className="text-xs text-gray-600">
            Hecho con amor en Lima, Perú
          </p>
        </div>
      </div>
    </footer>
  )
}
