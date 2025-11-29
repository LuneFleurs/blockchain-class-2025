export interface User {
  id: string;
  email: string;
  walletAddress: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  price: number;
  location: string;
  description: string;
  imageUrl: string;
  availableTickets: number;
  totalTickets: number;
  contractAddress?: string;
}

export interface Ticket {
  id: string;
  tokenId: number;
  status: 'OWNED' | 'REFUNDED' | 'RESALE_WAITING';
  event: Event;
  qrCode?: string;
  purchaseDate: string;
}
