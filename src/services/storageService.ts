import AsyncStorage from '@react-native-async-storage/async-storage';
import { BotConfig, WallapopItem, AppSettings } from '../types/bot';

const BOTS_KEY = '@wallapop_alert_bots_v1';
const ITEMS_KEY = '@wallapop_alert_items_v1';
const SETTINGS_KEY = '@wallapop_alert_settings_v1';

const defaultSettings: AppSettings = {
  themeMode: 'dark',
  autoRefreshEnabled: true,
  globalCheckInterval: 10,
  notificationsEnabled: true,
};

export const storageService = {
  // --- BOTS MANAGEMENT ---
  async getBots(): Promise<BotConfig[]> {
    try {
      const jsonStr = await AsyncStorage.getItem(BOTS_KEY);
      if (!jsonStr) return [];
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Error reading bots from storage:', e);
      return [];
    }
  },

  async saveBot(bot: Omit<BotConfig, 'id' | 'createdAt' | 'foundItemsCount'> & { id?: string }): Promise<BotConfig> {
    try {
      const bots = await this.getBots();
      const now = new Date().toISOString();

      if (bot.id) {
        // Edit existing
        const index = bots.findIndex((b) => b.id === bot.id);
        if (index !== -1) {
          const updatedBot: BotConfig = {
            ...bots[index],
            ...bot,
            id: bot.id,
          };
          bots[index] = updatedBot;
          await AsyncStorage.setItem(BOTS_KEY, JSON.stringify(bots));
          return updatedBot;
        }
      }

      // Create new
      const newBot: BotConfig = {
        ...bot,
        id: `bot_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        enabled: bot.enabled ?? true,
        foundItemsCount: 0,
        createdAt: now,
      };
      bots.unshift(newBot);
      await AsyncStorage.setItem(BOTS_KEY, JSON.stringify(bots));
      return newBot;
    } catch (e) {
      console.error('Error saving bot:', e);
      throw e;
    }
  },

  async deleteBot(botId: string): Promise<void> {
    try {
      const bots = await this.getBots();
      const filtered = bots.filter((b) => b.id !== botId);
      await AsyncStorage.setItem(BOTS_KEY, JSON.stringify(filtered));

      // Also clean up items associated with this bot
      const items = await this.getItems();
      const filteredItems = items.filter((item) => item.botId !== botId);
      await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(filteredItems));
    } catch (e) {
      console.error('Error deleting bot:', e);
      throw e;
    }
  },

  async toggleBot(botId: string): Promise<BotConfig | null> {
    try {
      const bots = await this.getBots();
      const index = bots.findIndex((b) => b.id === botId);
      if (index !== -1) {
        bots[index].enabled = !bots[index].enabled;
        await AsyncStorage.setItem(BOTS_KEY, JSON.stringify(bots));
        return bots[index];
      }
      return null;
    } catch (e) {
      console.error('Error toggling bot:', e);
      return null;
    }
  },

  async updateBotRunStats(botId: string, newItemsAddedCount: number): Promise<void> {
    try {
      const bots = await this.getBots();
      const index = bots.findIndex((b) => b.id === botId);
      if (index !== -1) {
        bots[index].lastRun = new Date().toISOString();
        bots[index].foundItemsCount = (bots[index].foundItemsCount || 0) + newItemsAddedCount;
        await AsyncStorage.setItem(BOTS_KEY, JSON.stringify(bots));
      }
    } catch (e) {
      console.error('Error updating bot stats:', e);
    }
  },

  // --- ITEMS MANAGEMENT ---
  async getItems(): Promise<WallapopItem[]> {
    try {
      const jsonStr = await AsyncStorage.getItem(ITEMS_KEY);
      if (!jsonStr) return [];
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Error reading items from storage:', e);
      return [];
    }
  },

  async saveNewItems(incomingItems: WallapopItem[]): Promise<WallapopItem[]> {
    try {
      if (!incomingItems || incomingItems.length === 0) return [];
      const currentItems = await this.getItems();
      const existingIds = new Set(currentItems.map((item) => item.id));

      const brandNewItems: WallapopItem[] = [];
      for (const item of incomingItems) {
        if (!existingIds.has(item.id)) {
          brandNewItems.push({
            ...item,
            isNew: true,
          });
        }
      }

      if (brandNewItems.length > 0) {
        // Prepend brand new items to current items list
        const updatedList = [...brandNewItems, ...currentItems];
        // Cap max stored items to 200 for memory efficiency
        const cappedList = updatedList.slice(0, 200);
        await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(cappedList));
      }

      return brandNewItems;
    } catch (e) {
      console.error('Error saving new items:', e);
      return [];
    }
  },

  async markAllItemsAsRead(): Promise<void> {
    try {
      const items = await this.getItems();
      const updated = items.map((item) => ({ ...item, isNew: false }));
      await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error marking items as read:', e);
    }
  },

  async deleteItem(itemId: string): Promise<void> {
    try {
      const items = await this.getItems();
      const filtered = items.filter((item) => item.id !== itemId);
      await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error('Error deleting item:', e);
    }
  },

  async clearAllItems(): Promise<void> {
    await AsyncStorage.removeItem(ITEMS_KEY);
  },

  // --- SETTINGS MANAGEMENT ---
  async getSettings(): Promise<AppSettings> {
    try {
      const jsonStr = await AsyncStorage.getItem(SETTINGS_KEY);
      if (!jsonStr) return defaultSettings;
      return { ...defaultSettings, ...JSON.parse(jsonStr) };
    } catch (e) {
      return defaultSettings;
    }
  },

  async saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Error saving settings:', e);
      throw e;
    }
  },

  // --- DEMO / MOCK DATA SEEDER ---
  async seedMockData(): Promise<{ bots: BotConfig[]; items: WallapopItem[] }> {
    const sampleBots: BotConfig[] = [
      {
        id: 'bot_bici_road',
        name: 'Bici Carretera Carbono',
        enabled: true,
        keywords: 'bicicleta carretera carbono',
        minPrice: 300,
        maxPrice: 1200,
        city: 'Madrid',
        distance: 25,
        checkIntervalMinutes: 5,
        lastRun: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
        foundItemsCount: 3,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      },
      {
        id: 'bot_ps5_slim',
        name: 'PS5 Slim Chollo',
        enabled: true,
        keywords: 'playstation 5 ps5 slim',
        minPrice: 200,
        maxPrice: 400,
        city: 'Barcelona',
        distance: 30,
        checkIntervalMinutes: 10,
        lastRun: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        foundItemsCount: 2,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      },
      {
        id: 'bot_macbook_m',
        name: 'MacBook Air M1/M2',
        enabled: false,
        keywords: 'macbook air m1 m2',
        minPrice: 450,
        maxPrice: 850,
        city: 'Valencia',
        distance: 50,
        checkIntervalMinutes: 15,
        lastRun: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        foundItemsCount: 4,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      },
    ];

    const sampleItems: WallapopItem[] = [
      {
        id: 'w_demo_101',
        botId: 'bot_bici_road',
        botName: 'Bici Carretera Carbono',
        title: 'Bicicleta Carretera Trek Emonda SL6 Carbono T-54',
        price: 890,
        currency: 'EUR',
        imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=400&auto=format&fit=crop',
        webSlug: 'bicicleta-carretera-trek-emonda-sl6-carbono',
        url: 'https://es.wallapop.com/search?keywords=bicicleta+carretera+carbono',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        isNew: true,
      },
      {
        id: 'w_demo_102',
        botId: 'bot_bici_road',
        botName: 'Bici Carretera Carbono',
        title: 'Specialized Tarmac Comp Ultegra Shimano',
        price: 750,
        currency: 'EUR',
        imageUrl: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?q=80&w=400&auto=format&fit=crop',
        webSlug: 'specialized-tarmac-comp-ultegra',
        url: 'https://es.wallapop.com/search?keywords=specialized+tarmac',
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        isNew: true,
      },
      {
        id: 'w_demo_103',
        botId: 'bot_ps5_slim',
        botName: 'PS5 Slim Chollo',
        title: 'Console Sony PlayStation 5 Slim 1TB + 2 Mandos DualSense',
        price: 340,
        currency: 'EUR',
        imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=400&auto=format&fit=crop',
        webSlug: 'playstation-5-slim-1tb-2-mandos',
        url: 'https://es.wallapop.com/search?keywords=playstation+5+slim',
        createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        isNew: false,
      },
      {
        id: 'w_demo_104',
        botId: 'bot_macbook_m',
        botName: 'MacBook Air M1/M2',
        title: 'Apple MacBook Air 13 M1 8GB 256GB SSD Gris Espacial',
        price: 520,
        currency: 'EUR',
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400&auto=format&fit=crop',
        webSlug: 'apple-macbook-air-13-m1-8gb-256gb',
        url: 'https://es.wallapop.com/search?keywords=macbook+air+m1',
        createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        isNew: false,
      },
    ];

    await AsyncStorage.setItem(BOTS_KEY, JSON.stringify(sampleBots));
    await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(sampleItems));
    return { bots: sampleBots, items: sampleItems };
  },

  async clearAllData(): Promise<void> {
    await AsyncStorage.removeItem(BOTS_KEY);
    await AsyncStorage.removeItem(ITEMS_KEY);
    await AsyncStorage.removeItem(SETTINGS_KEY);
  },
};
