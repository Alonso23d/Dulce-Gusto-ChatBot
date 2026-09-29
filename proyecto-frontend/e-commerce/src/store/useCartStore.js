import { create } from 'zustand'

const savedCart = JSON.parse(localStorage.getItem('cart') || '[]')

export const useCartStore = create((set, get) => ({
  items: savedCart,

  addItem: (product, quantity = 1, size = null, customization = '') => {
    const items = get().items
    const key = `${product.id}-${size}`
    const existing = items.find((i) => i.key === key)

    let updated
    if (existing) {
      updated = items.map((i) => i.key === key ? { ...i, quantity: i.quantity + quantity } : i)
    } else {
      updated = [...items, { key, product, quantity, size, customization }]
    }
    localStorage.setItem('cart', JSON.stringify(updated))
    set({ items: updated })
  },

  removeItem: (key) => {
    const updated = get().items.filter((i) => i.key !== key)
    localStorage.setItem('cart', JSON.stringify(updated))
    set({ items: updated })
  },

  updateQuantity: (key, quantity) => {
    if (quantity <= 0) { get().removeItem(key); return }
    const updated = get().items.map((i) => i.key === key ? { ...i, quantity } : i)
    localStorage.setItem('cart', JSON.stringify(updated))
    set({ items: updated })
  },

  clear: () => {
    localStorage.removeItem('cart')
    set({ items: [] })
  },

  total: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
  count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}))
