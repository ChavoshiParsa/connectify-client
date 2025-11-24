import { create } from 'zustand';

export type TypingUser = {
  dmKey: string;
  publicId: string;
};

type State = {
  typingUsers: TypingUser[];
};

type Actions = {
  startTyping: (dmKey: string, publicId: string) => void;
  stopTyping: (dmKey: string, publicId: string) => void;
};

const initialState: State = {
  typingUsers: [],
};

const typingTimeouts = new Map<string, number>();

export const useTypingStore = create<State & Actions>((set) => ({
  ...initialState,

  startTyping: (dmKey, publicId) => {
    const key = `${dmKey}:${publicId}`;

    const prevTimeoutId = typingTimeouts.get(key);
    if (prevTimeoutId) {
      window.clearTimeout(prevTimeoutId);
    }

    set((state) => {
      const exists = state.typingUsers.some((u) => u.dmKey === dmKey && u.publicId === publicId);
      if (exists) return state;

      return {
        ...state,
        typingUsers: [...state.typingUsers, { dmKey, publicId }],
      };
    });

    const timeoutId = window.setTimeout(() => {
      set((state) => ({
        ...state,
        typingUsers: state.typingUsers.filter((u) => !(u.dmKey === dmKey && u.publicId === publicId)),
      }));
      typingTimeouts.delete(key);
    }, 1500);

    typingTimeouts.set(key, timeoutId);
  },

  stopTyping: (dmKey, publicId) => {
    const key = `${dmKey}:${publicId}`;
    const prevTimeoutId = typingTimeouts.get(key);
    if (prevTimeoutId) {
      window.clearTimeout(prevTimeoutId);
    }
    typingTimeouts.delete(key);

    set((state) => ({
      ...state,
      typingUsers: state.typingUsers.filter((u) => !(u.dmKey === dmKey && u.publicId === publicId)),
    }));
  },
}));
