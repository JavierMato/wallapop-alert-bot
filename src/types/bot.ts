export interface BotConfig {
  id: string;
  name: string;
  enabled: boolean;
  keywords: string; // Search query terms (e.g. 'bicicleta carretera', 'ps5')
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  distance?: number; // In km
  latitude?: number;
  longitude?: number;
  checkIntervalMinutes: number; // e.g. 5, 10, 15, 30, 60
  lastRun?: string; // ISO timestamp string
  foundItemsCount: number;
  createdAt: string;
}

export interface WallapopItem {
  id: string;
  botId: string;
  botName?: string;
  title: string;
  price: number;
  currency: string;
  imageUrl?: string;
  webSlug?: string;
  url: string; // e.g. https://es.wallapop.com/item/[webSlug|id]
  createdAt: string; // Found timestamp or item creation timestamp
  isNew: boolean;
}

export interface AppSettings {
  themeMode: 'dark' | 'light';
  autoRefreshEnabled: boolean;
  globalCheckInterval: number; // fallback in minutes
  notificationsEnabled: boolean;
}

export interface SearchResult {
  success: boolean;
  botId: string;
  botName: string;
  newItemsCount: number;
  totalFetched: number;
  error?: string;
  timestamp: string;
}
