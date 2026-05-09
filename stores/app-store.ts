import { create } from 'zustand';

interface AppState {
  language: 'en' | 'la';
  sidebarOpen: boolean;
  setLanguage: (lang: 'en' | 'la') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: 'en',
  sidebarOpen: false,
  setLanguage: (language) => set({ language }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
