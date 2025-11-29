import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Ticket } from './types';
import { Language } from './translations';
import { authAPI } from './api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  setAuth: (data: { user: User; accessToken: string }) => void;
  logout: () => void;
}

interface TicketState {
  tickets: Ticket[];
  setTickets: (tickets: Ticket[]) => void;
  addTicket: (ticket: Ticket) => void;
  updateTicketStatus: (ticketId: string, status: Ticket['status']) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },
      login: async (email: string, password: string) => {
        try {
          const data = await authAPI.login(email, password);
          const user: User = {
            id: data.user.id,
            email: data.user.email,
            walletAddress: data.user.walletAddress,
          };

          set({
            user,
            isAuthenticated: true,
            accessToken: data.accessToken
          });
        } catch (error) {
          console.error('Login failed:', error);
          throw error;
        }
      },
      register: async (email: string, password: string) => {
        try {
          const data = await authAPI.register(email, password);
          const user: User = {
            id: data.user.id,
            email: data.user.email,
            walletAddress: data.user.walletAddress,
          };

          set({
            user,
            isAuthenticated: true,
            accessToken: data.accessToken
          });
        } catch (error) {
          console.error('Registration failed:', error);
          throw error;
        }
      },
      setAuth: (data: { user: User; accessToken: string }) => {
        set({
          user: data.user,
          isAuthenticated: true,
          accessToken: data.accessToken,
        });
      },
      logout: () => {
        set({ user: null, isAuthenticated: false, accessToken: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export const useTicketStore = create<TicketState>()(
  persist(
    (set) => ({
      tickets: [],
      setTickets: (tickets) => set({ tickets }),
      addTicket: (ticket) =>
        set((state) => ({ tickets: [...state.tickets, ticket] })),
      updateTicketStatus: (ticketId, status) =>
        set((state) => ({
          tickets: state.tickets.map((ticket) =>
            ticket.id === ticketId ? { ...ticket, status } : ticket
          ),
        })),
    }),
    {
      name: 'ticket-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'ko',
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
