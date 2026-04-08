import { create } from "zustand";

type CartItem = { id: string; name: string; price: number; quantity: number; };
type CartStore = {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
  getTotal: () => number;
};

export const useCartStore = create<CartStore>((set, get) => ({
  cart: [],
  addToCart: (product) => set((state) => {
    const existing = state.cart.find(item => item.id === product.id);
    if (existing) return { cart: state.cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) };
    return { cart: [...state.cart, { ...product, quantity: 1 }] };
  }),
  removeFromCart: (id) => set((state) => ({ cart: state.cart.filter(item => item.id !== id) })),
  increaseQuantity: (id) => set((state) => ({ cart: state.cart.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item) })),
  decreaseQuantity: (id) => set((state) => ({ cart: state.cart.map(item => item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item).filter(item => item.quantity > 0) })),
  clearCart: () => set({ cart: [] }),
  getTotal: () => get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));
