import { create } from 'zustand';

export type ViewMode = 'ROLE' | 'TOURIST';
export type TouristTab = 'overview' | 'my-plans' | 'favorites' | 'reviews';

interface AppState {
  language: 'en' | 'la';
  sidebarOpen: boolean;
  viewMode: ViewMode;
  touristTab: TouristTab;
  setLanguage: (lang: 'en' | 'la') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  setTouristTab: (tab: TouristTab) => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: 'en',
  sidebarOpen: false,
  viewMode: 'ROLE',
  touristTab: 'overview',

  setLanguage: (language) => set({ language }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setViewMode: (viewMode) => set({ viewMode }),
  setTouristTab: (touristTab) => set({ touristTab }),
}));