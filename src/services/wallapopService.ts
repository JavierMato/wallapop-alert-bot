import axios from 'axios';
import { BotConfig, WallapopItem, SearchResult } from '../types/bot';
import { storageService } from './storageService';

const WALLAPOP_SEARCH_URL = 'https://api.wallapop.com/api/v3/general/search';

// CORS proxies for Web execution if needed
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
];

export const wallapopService = {
  /**
   * Builds the query parameters for Wallapop search
   */
  buildQueryParams(bot: BotConfig): Record<string, string> {
    const params: Record<string, string> = {
      source: 'search_box',
      search_country: 'ES',
      section_type: 'organic_search_results',
      order_by: 'most_relevance',
    };

    if (bot.keywords && bot.keywords.trim()) {
      params['keywords'] = bot.keywords.trim();
    }

    if (bot.minPrice !== undefined && bot.minPrice !== null && !isNaN(bot.minPrice)) {
      params['min_sale_price'] = bot.minPrice.toString();
    }
    if (bot.maxPrice !== undefined && bot.maxPrice !== null && !isNaN(bot.maxPrice)) {
      params['max_sale_price'] = bot.maxPrice.toString();
    }

    if (bot.latitude !== undefined && bot.longitude !== undefined) {
      params['latitude'] = bot.latitude.toString();
      params['longitude'] = bot.longitude.toString();
    } else {
      params['latitude'] = '40.416775';
      params['longitude'] = '-3.703790';
    }

    return params;
  },

  /**
   * Executes a Wallapop API search for a single bot using the working /search/section endpoint
   */
  async executeBotSearch(bot: BotConfig): Promise<SearchResult> {
    const timestamp = new Date().toISOString();
    const queryParams = this.buildQueryParams(bot);

    // Generate tracking IDs for search/section API
    const deviceId = `${Math.random().toString(36).substring(2)}-${Date.now()}`;
    const searchId = `${Math.random().toString(36).substring(2)}-${Date.now()}`;
    const trackingId = Math.floor(Math.random() * 9e18).toString();

    const headers = {
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'es,es-ES;q=0.9',
      'deviceos': '0',
      'x-deviceos': '0',
      'mpid': trackingId,
      'trackinguserid': trackingId,
      'x-appversion': '826230',
      'x-deviceid': deviceId,
      'origin': 'https://es.wallapop.com',
      'referer': 'https://es.wallapop.com/',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    };

    let rawObjects: any[] = [];
    let fetchError: string | undefined;

    const endpointUrl = 'https://api.wallapop.com/api/v3/search/section';

    try {
      const response = await axios.get(endpointUrl, {
        params: { ...queryParams, search_id: searchId },
        headers: headers,
        timeout: 10000,
      });

      if (response.data) {
        rawObjects = response.data?.data?.section?.items || response.data?.search_objects || [];
      }
    } catch (err: any) {
      console.warn(`Direct Wallapop API call error for bot "${bot.name}":`, err?.message || err);

      if (err?.response?.status === 429) {
        fetchError = 'Límite de peticiones alcanzado en Wallapop (HTTP 429). Reintentando en breve.';
      } else if (err?.response?.status === 403) {
        fetchError = 'Acceso bloqueado por Wallapop (HTTP 403 / Cloudflare). Usa VPN o red diferente.';
      } else {
        fetchError = err?.message || 'Error de conexión con Wallapop';
      }
    }

    // Parse items into WallapopItem model
    const parsedItems: WallapopItem[] = rawObjects.map((obj: any, index: number) => {
      const itemId = obj.id ? obj.id.toString() : `w_${Date.now()}_${index}`;
      const webSlug = obj.web_slug || obj.slug || '';
      let itemUrl = obj.share_url || obj.url || obj.web_url;

      if (!itemUrl) {
        if (webSlug) {
          itemUrl = webSlug.startsWith('http') ? webSlug : `https://es.wallapop.com/item/${webSlug}`;
        } else {
          const cleanTitle = (obj.title || bot.keywords || 'producto')
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
          itemUrl = `https://es.wallapop.com/item/${cleanTitle}-${itemId}`;
        }
      }

      // Extract image URL
      let imageUrl = obj.images?.[0]?.urls?.medium || obj.images?.[0]?.original || obj.images?.[0]?.small || obj.main_image?.original;
      if (!imageUrl && typeof obj.images?.[0] === 'string') {
        imageUrl = obj.images[0];
      }

      // Extract price & currency
      const priceVal = typeof obj.price === 'number' ? obj.price : (obj.price?.amount || obj.sale_price || 0);
      const currencyVal = obj.currency || obj.price?.currency || 'EUR';

      return {
        id: itemId,
        botId: bot.id,
        botName: bot.name,
        title: obj.title || obj.headline || `Anuncio de ${bot.keywords}`,
        price: priceVal,
        currency: currencyVal,
        imageUrl: imageUrl,
        webSlug: webSlug,
        url: itemUrl,
        createdAt: new Date().toISOString(),
        isNew: true,
      };
    });

    // Deduplication logic against existing items in AsyncStorage
    const newItems = await storageService.saveNewItems(parsedItems);

    // Update bot stats in storage
    await storageService.updateBotRunStats(bot.id, newItems.length);

    return {
      success: !fetchError || parsedItems.length > 0,
      botId: bot.id,
      botName: bot.name,
      newItemsCount: newItems.length,
      totalFetched: parsedItems.length,
      error: fetchError,
      timestamp: timestamp,
    };
  },

  /**
   * Helper to generate realistic simulated items matching search keywords
   * when API returns no results or rate-limit blocks live scraping.
   */
  generateFallbackItemsForBot(bot: BotConfig): any[] {
    const basePrice = bot.minPrice ? bot.minPrice + 10 : 50;
    const maxPrice = bot.maxPrice ? bot.maxPrice - 5 : basePrice + 300;
    const keywords = bot.keywords || 'bicicleta';
    const cleanKw = keywords.toLowerCase().replace(/\s+/g, '-');
    const randomId1 = Math.floor(1040000000 + Math.random() * 9000000);
    const randomId2 = Math.floor(1040000000 + Math.random() * 9000000);

    return [
      {
        id: `${randomId1}`,
        title: `${keywords.charAt(0).toUpperCase() + keywords.slice(1)} en perfecto estado`,
        price: Math.floor(basePrice + Math.random() * (maxPrice - basePrice)),
        currency: 'EUR',
        web_slug: `${cleanKw}-excelente-estado-${randomId1}`,
        share_url: `https://es.wallapop.com/item/${cleanKw}-excelente-estado-${randomId1}`,
        images: [
          { original: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=400&auto=format&fit=crop' }
        ],
      },
      {
        id: `${randomId2}`,
        title: `Chollo ${keywords} - Como nuevo con garantía`,
        price: Math.floor(basePrice + Math.random() * (maxPrice - basePrice)),
        currency: 'EUR',
        web_slug: `chollo-${cleanKw}-garantia-${randomId2}`,
        share_url: `https://es.wallapop.com/item/chollo-${cleanKw}-garantia-${randomId2}`,
        images: [
          { original: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=400&auto=format&fit=crop' }
        ],
      }
    ];
  },
};
