// store/cart-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  color: string;
  size: string;
}

interface CartStore { 
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, color: string, size: string) => void;
  clearCart: () => void;
  getTotalQuantity: () => number;
  getTotalPrice: () => number;
  // New methods for cart syncing
  setItems: (items: CartItem[]) => void;
  mergeItems: (serverItems: CartItem[]) => void;
  getItems: () => CartItem[];
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      // Add item to cart
      addItem: (newItem) => set((state) => {
        // Find item with same ID, color, and size
        const itemExists = state.items.find(
          item => item.id === newItem.id && 
                 item.color === newItem.color && 
                 item.size === newItem.size
        );
        
        if (itemExists) {
          // Increase quantity by the new item's quantity
          return {
            items: state.items.map(item =>
              item.id === newItem.id && 
              item.color === newItem.color && 
              item.size === newItem.size
                ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
                : item
            )
          };
        } else {
          // Add new item
          return { 
            items: [...state.items, newItem] 
          };
        }
      }),

      // Remove one quantity
      removeItem: (id, color, size) => set((state) => ({
        items: state.items
          .map(item =>
            item.id === id && item.color === color && item.size === size
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter(item => item.quantity > 0)
      })),
      
      clearCart: () => set({ items: [] }),
      
      getTotalQuantity: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => 
          total + (item.price * item.quantity), 0
        );
      },
      
      // Set items (for syncing)
      setItems: (items: CartItem[]) => set({ items }),
      
      // Merge items with server items
      mergeItems: (serverItems: CartItem[]) => set((state) => {
        const mergedMap = new Map();
        
        // Add server items to map
        serverItems.forEach(item => {
          const key = `${item.id}-${item.color}-${item.size}`;
          mergedMap.set(key, { ...item });
        });
        
        // Merge with client items
        state.items.forEach(clientItem => {
          const key = `${clientItem.id}-${clientItem.color}-${clientItem.size}`;
          const existingItem = mergedMap.get(key);
          
          if (existingItem) {
            // Update quantity (client items take precedence for merging)
            mergedMap.set(key, {
              ...existingItem,
              quantity: existingItem.quantity + clientItem.quantity
            });
          } else {
            // Add new item
            mergedMap.set(key, { ...clientItem });
          }
        });
        
        return { items: Array.from(mergedMap.values()) };
      }),
      
      // Get items
      getItems: () => get().items
    }),
    { 
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);