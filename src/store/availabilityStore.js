import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAvailabilityStore = create(
  persist(
    (set) => ({
      isAvailable: true,
      
      setAvailable: (available) => set({ 
        isAvailable: available 
      }),
      
      toggleAvailability: () => set((state) => ({ 
        isAvailable: !state.isAvailable 
      })),
    }),
    {
      name: 'availability-storage',
    }
  )
);
