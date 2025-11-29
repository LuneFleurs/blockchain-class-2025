import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    // Zustand persist에서 토큰 가져오기
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        if (state?.accessToken) {
          config.headers.Authorization = `Bearer ${state.accessToken}`;
        }
      } catch (error) {
        console.error('Failed to parse auth storage:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const method = error.config?.method?.toUpperCase();
    const url = error.config?.url;

    // 401 에러: 인증 실패
    if (status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }

    // 400 에러: 예상된 비즈니스 로직 에러 (경고로 처리)
    else if (status === 400) {
      const message = error.response?.data?.message || 'Bad Request';
      console.warn(
        `⚠️ ${method} ${url} - ${status} Bad Request\n` +
        `Message: ${message}`
      );
    }

    // 그 외 에러: 예상치 못한 에러 (에러로 처리)
    else if (error.response) {
      console.error(
        `❌ ${method} ${url} - ${status} ${error.response.statusText}\n`,
        error.response.data
      );
    } else {
      console.error(`❌ Network Error: ${method} ${url}`, error.message);
    }

    return Promise.reject(error);
  }
);

// 인증 API
export const authAPI = {
  register: async (email: string, password: string) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// 공연 API
export const eventsAPI = {
  getAll: async () => {
    const response = await api.get('/events');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  create: async (eventData: {
    title: string;
    date: string;
    price: number;
    contractAddress: string;
    location?: string;
    description?: string;
    imageUrl?: string;
    totalTickets?: number;
  }) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  update: async (id: string, eventData: {
    title?: string;
    date?: string;
    price?: number;
    location?: string;
    description?: string;
    imageUrl?: string;
    totalTickets?: number;
  }) => {
    const response = await api.patch(`/events/${id}`, eventData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
};

// 티켓 API
export const ticketsAPI = {
  buy: async (eventId: string) => {
    const response = await api.post('/tickets/buy', { eventId });
    return response.data;
  },

  getMy: async () => {
    const response = await api.get('/tickets/my');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  getBlockchainInfo: async (tokenId: number) => {
    const response = await api.get(`/tickets/blockchain/${tokenId}`);
    return response.data;
  },

  refund: async (id: string) => {
    const response = await api.post(`/tickets/${id}/refund`);
    return response.data;
  },
};

// 대기열 API
export const waitlistAPI = {
  join: async (eventId: string) => {
    const response = await api.post(`/waitlist/${eventId}`);
    return response.data;
  },

  leave: async (eventId: string) => {
    const response = await api.delete(`/waitlist/${eventId}`);
    return response.data;
  },

  getStatus: async (eventId: string) => {
    const response = await api.get(`/waitlist/${eventId}/status`);
    return response.data;
  },

  getEventWaitlist: async (eventId: string) => {
    const response = await api.get(`/waitlist/${eventId}`);
    return response.data;
  },
};

export default api;
