import { create } from 'zustand';

export const useProposalStore = create((set) => ({
  unreadProposalCount: 0,
  
  setUnreadProposalCount: (count) => set({ 
    unreadProposalCount: count 
  }),
  
  incrementUnreadProposalCount: () => set((state) => ({ 
    unreadProposalCount: state.unreadProposalCount + 1 
  })),
  
  decrementUnreadProposalCount: () => set((state) => ({ 
    unreadProposalCount: Math.max(0, state.unreadProposalCount - 1)
  })),
  
  resetUnreadProposalCount: () => set({ 
    unreadProposalCount: 0 
  }),
}));
