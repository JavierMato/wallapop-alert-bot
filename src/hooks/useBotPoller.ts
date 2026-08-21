import { useState, useEffect, useCallback, useRef } from 'react';
import { BotConfig, WallapopItem, SearchResult, AppSettings } from '../types/bot';
import { storageService } from '../services/storageService';
import { wallapopService } from '../services/wallapopService';

export function useBotPoller() {
  const [bots, setBots] = useState<BotConfig[]>([]);
  const [items, setItems] = useState<WallapopItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    themeMode: 'dark',
    autoRefreshEnabled: true,
    globalCheckInterval: 10,
    notificationsEnabled: true,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [lastSearchResults, setLastSearchResults] = useState<SearchResult[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const pollerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1. Initial Load & Seed check
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      let loadedBots = await storageService.getBots();
      let loadedItems = await storageService.getItems();
      const loadedSettings = await storageService.getSettings();

      // Seed mock data on first load if empty
      if (loadedBots.length === 0 && loadedItems.length === 0) {
        const seeded = await storageService.seedMockData();
        loadedBots = seeded.bots;
        loadedItems = seeded.items;
      }

      setBots(loadedBots);
      setItems(loadedItems);
      setSettings(loadedSettings);
    } catch (e) {
      console.error('Failed loading poller data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 2. Execute search for all enabled bots or a specific bot
  const runSearchForAllBots = useCallback(async (): Promise<SearchResult[]> => {
    if (isSearching) return [];
    setIsSearching(true);
    setStatusMessage('Buscando ofertas en Wallapop...');

    try {
      const currentBots = await storageService.getBots();
      const activeBots = currentBots.filter((b) => b.enabled);

      if (activeBots.length === 0) {
        setStatusMessage('No hay bots activos para ejecutar.');
        setIsSearching(false);
        return [];
      }

      const results: SearchResult[] = [];
      let totalNewFound = 0;

      for (const bot of activeBots) {
        setStatusMessage(`Buscando: ${bot.name}...`);
        const res = await wallapopService.executeBotSearch(bot);
        results.push(res);
        totalNewFound += res.newItemsCount;
      }

      setLastSearchResults(results);

      // Refresh bots and items state
      const updatedBots = await storageService.getBots();
      const updatedItems = await storageService.getItems();
      setBots(updatedBots);
      setItems(updatedItems);

      if (totalNewFound > 0) {
        setStatusMessage(`¡${totalNewFound} nuevo(s) chollo(s) encontrado(s)!`);
      } else {
        setStatusMessage('Búsqueda completada. Sin novedades.');
      }

      return results;
    } catch (err: any) {
      setStatusMessage(`Error en la búsqueda: ${err?.message || 'Error de red'}`);
      return [];
    } finally {
      setIsSearching(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  }, [isSearching]);

  // 3. Single bot manual search
  const runSearchForBot = useCallback(async (botId: string): Promise<SearchResult | null> => {
    if (isSearching) return null;
    setIsSearching(true);

    try {
      const currentBots = await storageService.getBots();
      const bot = currentBots.find((b) => b.id === botId);
      if (!bot) return null;

      setStatusMessage(`Ejecutando bot: ${bot.name}...`);
      const res = await wallapopService.executeBotSearch(bot);

      const updatedBots = await storageService.getBots();
      const updatedItems = await storageService.getItems();
      setBots(updatedBots);
      setItems(updatedItems);

      if (res.newItemsCount > 0) {
        setStatusMessage(`¡${res.newItemsCount} nuevo chollo para ${bot.name}!`);
      } else {
        setStatusMessage(`Bot "${bot.name}" ejecutado sin nuevos resultados.`);
      }

      return res;
    } catch (err: any) {
      setStatusMessage(`Error ejecutando bot: ${err?.message}`);
      return null;
    } finally {
      setIsSearching(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  }, [isSearching]);

  // 4. Foreground Polling Interval setup
  useEffect(() => {
    if (pollerTimerRef.current) {
      clearInterval(pollerTimerRef.current);
    }

    if (!settings.autoRefreshEnabled) return;

    // Check active bots intervals (default to minimum interval or 1 minute check tick)
    const tickIntervalMs = 60 * 1000; // Check every 60 seconds

    pollerTimerRef.current = setInterval(async () => {
      const currentBots = await storageService.getBots();
      const now = Date.now();

      const botsDue = currentBots.filter((bot) => {
        if (!bot.enabled) return false;
        if (!bot.lastRun) return true;
        const lastRunMs = new Date(bot.lastRun).getTime();
        const intervalMs = (bot.checkIntervalMinutes || 10) * 60 * 1000;
        return now - lastRunMs >= intervalMs;
      });

      if (botsDue.length > 0 && !isSearching) {
        for (const bot of botsDue) {
          await wallapopService.executeBotSearch(bot);
        }
        const updatedBots = await storageService.getBots();
        const updatedItems = await storageService.getItems();
        setBots(updatedBots);
        setItems(updatedItems);
      }
    }, tickIntervalMs);

    return () => {
      if (pollerTimerRef.current) {
        clearInterval(pollerTimerRef.current);
      }
    };
  }, [settings.autoRefreshEnabled, isSearching]);

  // 5. Bot CRUD actions
  const toggleBot = async (botId: string) => {
    const updated = await storageService.toggleBot(botId);
    if (updated) {
      setBots((prev) => prev.map((b) => (b.id === botId ? updated : b)));
    }
  };

  const deleteBot = async (botId: string) => {
    await storageService.deleteBot(botId);
    setBots((prev) => prev.filter((b) => b.id !== botId));
    setItems((prev) => prev.filter((i) => i.botId !== botId));
  };

  const saveBot = async (botData: Omit<BotConfig, 'id' | 'createdAt' | 'foundItemsCount'> & { id?: string }) => {
    const saved = await storageService.saveBot(botData);
    await loadData();
    return saved;
  };

  // 6. Items actions
  const markAllAsRead = async () => {
    await storageService.markAllItemsAsRead();
    setItems((prev) => prev.map((i) => ({ ...i, isNew: false })));
  };

  const deleteItem = async (itemId: string) => {
    await storageService.deleteItem(itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const testApiConnection = async (): Promise<SearchResult> => {
    setIsSearching(true);
    try {
      const currentBots = await storageService.getBots();
      const targetBot: BotConfig = currentBots.length > 0
        ? currentBots[0]
        : {
            id: 'bot_test_api',
            name: 'Bot Prueba API',
            enabled: true,
            keywords: 'bicicleta',
            checkIntervalMinutes: 10,
            foundItemsCount: 0,
            createdAt: new Date().toISOString(),
          };

      const res = await wallapopService.executeBotSearch(targetBot);

      // Instantly refresh React state for items and bots
      const updatedBots = await storageService.getBots();
      const updatedItems = await storageService.getItems();
      setBots(updatedBots);
      setItems(updatedItems);

      return res;
    } finally {
      setIsSearching(false);
    }
  };

  // 7. Settings & Demo actions
  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = await storageService.saveSettings(newSettings);
    setSettings(updated);
  };

  const seedDemoData = async () => {
    const seeded = await storageService.seedMockData();
    setBots(seeded.bots);
    setItems(seeded.items);
    setStatusMessage('Datos de prueba cargados correctamente');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const clearAllData = async () => {
    await storageService.clearAllData();
    setBots([]);
    setItems([]);
    setStatusMessage('Todos los datos han sido borrados');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return {
    bots,
    items,
    settings,
    loading,
    isSearching,
    statusMessage,
    lastSearchResults,
    loadData,
    runSearchForAllBots,
    runSearchForBot,
    testApiConnection,
    toggleBot,
    deleteBot,
    saveBot,
    markAllAsRead,
    deleteItem,
    updateSettings,
    seedDemoData,
    clearAllData,
  };
}
