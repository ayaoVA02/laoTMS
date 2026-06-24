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

function getInitialLanguage(): 'en' | 'la' {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('app-language');
    if (saved === 'en' || saved === 'la') return saved;
    const i18nLng = localStorage.getItem('i18nextLng');
    if (i18nLng === 'en' || i18nLng === 'la') return i18nLng;
  }
  return 'la';
}

export const useAppStore = create<AppState>((set) => ({
  language: getInitialLanguage(),
  sidebarOpen: false,
  viewMode: 'ROLE',
  touristTab: 'overview',

  setLanguage: (language) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-language', language);
    }
    set({ language });
  },
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setViewMode: (viewMode) => set({ viewMode }),
  setTouristTab: (touristTab) => set({ touristTab }),
}));
