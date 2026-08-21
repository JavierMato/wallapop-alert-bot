import axios from 'axios';
import { BotConfig, WallapopItem, SearchResult } from '../types/bot';
import { storageService } from './storageService';

const CITY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  madrid: { latitude: 40.416775, longitude: -3.703790 },
  barcelona: { latitude: 41.385064, longitude: 2.173403 },
  valencia: { latitude: 39.469907, longitude: -0.376288 },
  sevilla: { latitude: 37.389092, longitude: -5.984459 },
  zaragoza: { latitude: 41.648823, longitude: -0.889085 },
  malaga: { latitude: 36.721261, longitude: -4.421266 },
  málaga: { latitude: 36.721261, longitude: -4.421266 },
  murcia: { latitude: 37.992240, longitude: -1.130654 },
  palma: { latitude: 39.569601, longitude: 2.650160 },
  bilbao: { latitude: 43.263013, longitude: -2.934985 },
  alicante: { latitude: 38.345996, longitude: -0.490685 },
  cordoba: { latitude: 37.888175, longitude: -4.779383 },
  códoba: { latitude: 37.888175, longitude: -4.779383 },
  valladolid: { latitude: 41.652251, longitude: -4.724532 },
  vigo: { latitude: 42.240599, longitude: -8.720727 },
  gijon: { latitude: 43.535730, longitude: -5.661519 },
  gijón: { latitude: 43.535730, longitude: -5.661519 },
  granada: { latitude: 37.177336, longitude: -3.598557 },
  coruña: { latitude: 43.362344, longitude: -8.411540 },
  "a coruña": { latitude: 43.362344, longitude: -8.411540 },
};

const WALLAPOP_SEARCH_URL = 'https://api.wallapop.com/api/v3/search/section';

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

    // Determine latitude & longitude
    let lat: number | undefined = bot.latitude;
    let lng: number | undefined = bot.longitude;

    if (lat === undefined || lng === undefined) {
      if (bot.city && bot.city.trim()) {
        const cleanCity = bot.city.toLowerCase().trim();
        const found = CITY_COORDINATES[cleanCity];
        if (found) {
          lat = found.latitude;
          lng = found.longitude;
        }
      }
    }

    // Default to Madrid if unspecified or city not in map
    params['latitude'] = (lat !== undefined ? lat : 40.416775).toString();
    params['longitude'] = (lng !== undefined ? lng : -3.703790).toString();

    // Distance in km or meters if specified
    if (bot.distance !== undefined && bot.distance > 0) {
      params['distance'] = (bot.distance * 1000).toString(); // Convert km to meters
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

    try {
      const response = await axios.get(WALLAPOP_SEARCH_URL, {
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
};
