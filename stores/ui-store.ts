import { create } from 'zustand';

type State = {
  isSidebarOpen: boolean;
};

type Actions = {
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
};

const initialState: State = {
  isSidebarOpen: false,
};

export const useSidebarStore = create<State & Actions>((set) => ({
  ...initialState,
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
