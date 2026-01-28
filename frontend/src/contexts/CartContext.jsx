import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    // Load from localStorage on mount
    try {
      const saved = localStorage.getItem('pharmafind_cart')
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
      return []
    }
  })

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('pharmafind_cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (item) => {
    setCartItems((prev) => {
      // Check if item already exists (same pharmacy, medicine, and mode)
      const existingIndex = prev.findIndex(
        (i) =>
          i.pharmacyName === item.pharmacyName &&
          i.medicineName === item.medicineName &&
          i.mode === item.mode
      )

      if (existingIndex >= 0) {
        // Update quantity if exists
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + (item.quantity || 1),
        }
        return updated
      } else {
        // Add new item
        return [...prev, { ...item, quantity: item.quantity || 1 }]
      }
    })
  }

  const removeFromCart = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index))
  }

  const updateQuantity = (index, quantity) => {
    if (quantity <= 0) {
      removeFromCart(index)
      return
    }
    setCartItems((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], quantity }
      return updated
    })
  }

  const clearCart = () => {
    setCartItems([])
  }

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
