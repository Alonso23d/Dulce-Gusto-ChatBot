import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ChevronRight, Truck, ShieldCheck, Clock, Star,
  CakeSlice, Cake, Cookie, Layers2, Wheat, Heart, Award,
} from 'lucide-react'
import api from '../../lib/api'
import ProductCard from '../../components/ProductCard'
import heroImg from '../../assets/hero.png'

const CATEGORY_ICONS = {
  tortas:     Cake,
  cupcakes:   CakeSlice,
  macarons:   Cookie,
  cheesecake: Layers2,
  alfajores:  Wheat,
}

const CATEGORY_GRADIENTS = {
  tortas:     'from-rose-400 to-pink-600',
  cupcakes:   'from-purple-400 to-brand-600',
  macarons:   'from-amber-400 to-orange-500',
  cheesecake: 'from-yellow-400 to-amber-500',
  alfajores:  'from-orange-400 to-red-500',
}

const PAYMENT_METHODS = [
  { name: 'Visa',         bg: 'bg-blue-700',   abbr: 'VISA' },
  { name: 'Mastercard',   bg: 'bg-red-600',    abbr: 'MC' },
  { name: 'Yape',         bg: 'bg-purple-700', abbr: 'YAPE' },
  { name: 'Plin',         bg: 'bg-green-600',  abbr: 'PLIN' },
  { name: 'BCP',          bg: 'bg-blue-900',   abbr: 'BCP' },
  { name: 'Transferencia',bg: 'bg-gray-700',   abbr: 'TRANSF.' },
  { name: 'Efectivo',     bg: 'bg-emerald-700',abbr: 'CASH' },
]

const TESTIMONIALS = [
  { name: 'María García',    role: 'Cliente frecuente', text: 'La torta de mi boda fue increíble, todos mis invitados quedaron encantados. El sabor y la decoración superaron mis expectativas.', stars: 5 },
  { name: 'Carlos Mendoza',  role: 'Cliente desde 2023', text: 'Pedí cupcakes para el cumpleaños de mi hija y llegaron perfectos y a tiempo. La presentación fue hermosa.', stars: 5 },
  { name: 'Ana Torres',      role: 'Cliente habitual',   text: 'Los macarons son simplemente deliciosos. Ya los he pedido tres veces y siempre están perfectos. 100% recomendados.', stars: 5 },
]

export default function HomePage() {
  const { data: productsData } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => api.get('/products?featured=true&per_page=8').then((r) => r.data),
  })

  const { data: allProductsData } = useQuery({
    queryKey: ['all-products-carousel'],
    queryFn: () => api.get('/products?per_page=50').then((r) => r.data),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  })

  const featured   = productsData?.data     || []
  const allProds   = allProductsData?.data  || []
  const cats       = categories             || []

  // Duplicar para carrusel infinito
  const carouselItems = allProds.length > 0 ? [...allProds, ...allProds] : []

  return (
    <div>

      {/* ── Hero ── */}
      <section className="relative bg-[#fdf2e2] overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
        
        {/* Background Image on the right side */}
        <div className="absolute inset-y-0 right-0 w-full lg:w-[65%] pointer-events-none">
          <img 
            src="/hero-light.jpg" 
            onError={(e) => { e.target.onerror = null; e.target.src = heroImg }}
            alt="Fondo de pastelería" 
            className="absolute inset-0 w-full h-full object-cover object-left" 
          />
          {/* Subtle gradient only on the edges to fade into the background */}
          <div className="hidden lg:block absolute inset-y-0 left-0 w-64 bg-gradient-to-r from-[#fdf2e2] via-[#fdf2e2]/90 to-transparent" />
          <div className="hidden lg:block absolute inset-y-0 left-0 w-32 bg-[#fdf2e2]" style={{ filter: 'blur(10px)', transform: 'translateX(-50%)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 lg:py-36 flex items-center">
          <div className="w-full lg:w-1/2 text-center lg:text-left z-10 relative">
            <div className="inline-flex items-center gap-2 bg-[#f6eaff] text-[#9333ea] text-sm font-semibold px-5 py-2 rounded-full mb-6 shadow-sm">
              <Star size={16} className="fill-[#9333ea] text-[#9333ea]" />
              +500 clientes satisfechos en Lima
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight drop-shadow-sm">
              Pasteles que <br className="hidden lg:block" /> cuentan{' '}
              <span className="text-[#a67c00]">historias</span>
            </h1>
            <p className="text-gray-800 text-lg mb-8 max-w-lg mx-auto lg:mx-0 font-medium drop-shadow-sm">
              Tortas artesanales, cupcakes y macarons elaborados con ingredientes premium.
              Delivery en todo Lima el mismo día.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link to="/catalogo" className="btn-primary btn-lg px-8 shadow-lg shadow-brand-500/30">
                Ver catálogo <ChevronRight size={18} />
              </Link>
              <Link to="/nosotros" className="btn-lg border-2 border-gray-900 text-gray-900 bg-transparent hover:bg-gray-900 hover:text-white transition-colors rounded-xl font-bold px-8">
                Nuestra historia
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features bar ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Truck,       title: 'Delivery en Lima',       desc: 'Entrega el mismo día en los principales distritos.' },
            { icon: ShieldCheck, title: 'Ingredientes premium',   desc: 'Solo usamos los mejores ingredientes frescos.' },
            { icon: Clock,       title: 'Pedido en minutos',      desc: 'Proceso simple y pago seguro. Sin complicaciones.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4">
              <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                <Icon size={20} className="text-brand-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categorías ── */}
      {cats.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Categorías</h2>
              <p className="text-gray-500 mt-1">Explora nuestra variedad artesanal</p>
            </div>
            <Link to="/catalogo" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors">
              Ver todo <ChevronRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {cats.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.slug] || Cake
              return (
                <Link
                  key={cat.id}
                  to={`/catalogo?category=${cat.slug}`}
                  className="group relative overflow-hidden bg-white border border-[#f0e4d8] rounded-2xl aspect-[4/3] flex flex-col items-center justify-center gap-3 p-4 shadow-sm hover:shadow-xl hover:border-brand-200 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-[#fdf2e2] rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-50 transition-all duration-300">
                      <Icon size={28} className="text-[#a67c00] group-hover:text-brand-600 transition-colors duration-300" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-brand-700 transition-colors">{cat.name}</h3>
                      <p className="text-gray-500 text-xs mt-0.5">{cat.products_count} productos</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Carrusel automático ── */}
      {carouselItems.length > 0 && (
        <section className="py-12 bg-gray-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
            <h2 className="section-title">Todos nuestros productos</h2>
            <p className="section-sub">Pasa el cursor para pausar · Clic para ver el detalle</p>
          </div>
          <div className="relative">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

            <div className="flex animate-marquee gap-4 w-max">
              {carouselItems.map((p, i) => (
                <Link
                  key={`${p.id}-${i}`}
                  to={`/producto/${p.slug}`}
                  className="shrink-0 w-52 bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all overflow-hidden group"
                >
                  <div className="aspect-square overflow-hidden bg-gradient-to-br from-brand-50 to-rose-50">
                    {p.image
                      ? <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center"><Cake size={40} className="text-brand-300" /></div>
                    }
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-gray-900 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.category?.name}</p>
                    <p className="font-bold text-brand-600 text-sm mt-2">S/ {Number(p.price).toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Más vendidos (grid) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-title">Más vendidos</h2>
            <p className="section-sub">Los favoritos de nuestros clientes</p>
          </div>
          <Link to="/catalogo" className="btn-ghost text-brand-600 hover:bg-brand-50 hidden sm:flex text-sm">
            Ver todos <ChevronRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {featured.length > 0
            ? featured.map((p) => <ProductCard key={p.id} product={p} />)
            : Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card h-72 animate-pulse bg-gray-100" />
              ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/catalogo" className="btn-primary btn-lg">
            Ver catálogo completo <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative bg-[#fdf2e2] border-y border-[#f0e4d8] py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-[#f0e4d8]">
            <Heart size={28} className="text-[#a67c00]" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight drop-shadow-sm">
            ¿Tienes una <span className="text-[#a67c00]">ocasión especial</span>?
          </h2>
          <p className="text-gray-800 mb-8 text-lg max-w-xl mx-auto font-medium">
            Personalizamos tu torta con el mensaje y decoración que desees.<br className="hidden sm:block" />
            Bodas, cumpleaños, graduaciones y más.
          </p>
          <Link to="/catalogo" className="btn-primary btn-lg px-8 shadow-lg shadow-brand-500/30">
            Personalizar mi pedido
          </Link>
        </div>
      </section>

      {/* ── Testimonios ── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="section-title">Lo que dicen nuestros clientes</h2>
            <p className="section-sub mt-1">Más de 500 familias felices en Lima</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card p-6 flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-rose-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Métodos de pago ── */}
      <section className="bg-gray-50 border-t border-b border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-bold text-gray-900 text-sm">Métodos de pago aceptados</p>
              <p className="text-gray-500 text-xs mt-0.5">Pago 100% seguro y protegido</p>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end gap-2">
              {PAYMENT_METHODS.map((pm) => (
                <div
                  key={pm.name}
                  className={`${pm.bg} text-white text-xs font-bold px-4 py-2 rounded-lg tracking-wide`}
                >
                  {pm.abbr}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <ShieldCheck size={16} className="text-green-500" />
                Compra protegida
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Award size={16} className="text-brand-500" />
                Calidad garantizada
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
