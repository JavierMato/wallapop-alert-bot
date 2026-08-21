import axios from 'axios';

export interface LocationSuggestion {
  id: string;
  name: string;
  fullName: string;
  latitude: number;
  longitude: number;
}

const FALLBACK_CITIES: LocationSuggestion[] = [
  { id: 'madrid', name: 'Madrid', fullName: 'Madrid, Comunidad de Madrid, España', latitude: 40.416775, longitude: -3.703790 },
  { id: 'barcelona', name: 'Barcelona', fullName: 'Barcelona, Cataluña, España', latitude: 41.385064, longitude: 2.173403 },
  { id: 'valencia', name: 'Valencia', fullName: 'Valencia, Comunidad Valenciana, España', latitude: 39.469907, longitude: -0.376288 },
  { id: 'sevilla', name: 'Sevilla', fullName: 'Sevilla, Andalucía, España', latitude: 37.389092, longitude: -5.984459 },
  { id: 'zaragoza', name: 'Zaragoza', fullName: 'Zaragoza, Aragón, España', latitude: 41.648823, longitude: -0.889085 },
  { id: 'malaga', name: 'Málaga', fullName: 'Málaga, Andalucía, España', latitude: 36.721261, longitude: -4.421266 },
  { id: 'murcia', name: 'Murcia', fullName: 'Murcia, Región de Murcia, España', latitude: 37.992240, longitude: -1.130654 },
  { id: 'palma', name: 'Palma de Mallorca', fullName: 'Palma, Islas Baleares, España', latitude: 39.569601, longitude: 2.650160 },
  { id: 'bilbao', name: 'Bilbao', fullName: 'Bilbao, País Vasco, España', latitude: 43.263013, longitude: -2.934985 },
  { id: 'alicante', name: 'Alicante', fullName: 'Alicante, Comunidad Valenciana, España', latitude: 38.345996, longitude: -0.490685 },
  { id: 'cordoba', name: 'Córdoba', fullName: 'Córdoba, Andalucía, España', latitude: 37.888175, longitude: -4.779383 },
  { id: 'valladolid', name: 'Valladolid', fullName: 'Valladolid, Castilla y León, España', latitude: 41.652251, longitude: -4.724532 },
  { id: 'vigo', name: 'Vigo', fullName: 'Vigo, Galicia, España', latitude: 42.240599, longitude: -8.720727 },
  { id: 'gijon', name: 'Gijón', fullName: 'Gijón, Asturias, España', latitude: 43.535730, longitude: -5.661519 },
  { id: 'granada', name: 'Granada', fullName: 'Granada, Andalucía, España', latitude: 37.177336, longitude: -3.598557 },
  { id: 'coruna', name: 'A Coruña', fullName: 'A Coruña, Galicia, España', latitude: 43.362344, longitude: -8.411540 },
];

export const geocodingService = {
  /**
   * Search towns, cities, and municipalities in Spain via OpenStreetMap Nominatim API
   */
  async searchLocations(query: string): Promise<LocationSuggestion[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery || cleanQuery.length < 2) {
      return FALLBACK_CITIES.slice(0, 6);
    }

    try {
      const url = `https://nominatim.openstreetmap.org/search`;
      const response = await axios.get(url, {
        params: {
          q: cleanQuery,
          format: 'json',
          addressdetails: 1,
          countrycodes: 'es',
          limit: 6,
        },
        headers: {
          'User-Agent': 'WallapopAlertBot/1.0 (MobileApp)',
          'Accept-Language': 'es-ES,es;q=0.9',
        },
        timeout: 4000,
      });

      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data.map((item: any, idx: number) => {
          const address = item.address || {};
          const cityName =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            address.suburb ||
            item.display_name.split(',')[0];

          return {
            id: `loc_${item.place_id || idx}`,
            name: cityName,
            fullName: item.display_name,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
          };
        });
      }
    } catch (error) {
      console.warn('Geocoding search failed, falling back to local list:', error);
    }

    // Fallback to local filtering
    const qLower = cleanQuery.toLowerCase();
    const filtered = FALLBACK_CITIES.filter(
      (c) => c.name.toLowerCase().includes(qLower) || c.fullName.toLowerCase().includes(qLower)
    );
    return filtered.length > 0 ? filtered : FALLBACK_CITIES.slice(0, 5);
  },
};
