import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Alert } from 'react-native';
import { WallapopItem } from '../types/bot';
import { ThemeColors } from '../theme/colors';
import { ExternalLink, Tag, Clock, Sparkles, Trash2 } from 'lucide-react-native';

interface ItemCardProps {
  item: WallapopItem;
  theme: ThemeColors;
  onDelete?: (id: string) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, theme, onDelete }) => {
  const handleOpenUrl = async () => {
    try {
      let urlToOpen = item.url;
      if (!urlToOpen) {
        if (item.webSlug) {
          urlToOpen = `https://es.wallapop.com/item/${item.webSlug}`;
        } else {
          urlToOpen = `https://es.wallapop.com/app/search?keywords=${encodeURIComponent(item.title || item.botName || 'chollo')}`;
        }
      }
      await Linking.openURL(urlToOpen);
    } catch (err) {
      Alert.alert('Error', 'No se pudo abrir el enlace de Wallapop.');
    }
  };

  const handleOpenSearch = async (e: any) => {
    e.stopPropagation();
    try {
      const searchKeywords = encodeURIComponent(item.title || item.botName || 'chollo');
      const searchUrl = `https://es.wallapop.com/app/search?keywords=${searchKeywords}`;
      await Linking.openURL(searchUrl);
    } catch (err) {
      Alert.alert('Error', 'No se pudo abrir la búsqueda en Wallapop.');
    }
  };

  const formatTime = (isoDate: string) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const mins = Math.floor(diffMs / (1000 * 60));
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `Hace ${mins} m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours} h`;
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=400&auto=format&fit=crop';

  return (
    <TouchableOpacity
      style={[styles.cardContainer, { backgroundColor: theme.cardBg, borderColor: theme.surfaceBorder }]}
      onPress={handleOpenUrl}
      activeOpacity={0.85}
    >
      {/* Thumbnail Area */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: item.imageUrl || fallbackImage }}
          style={styles.thumbnail}
          resizeMode="cover"
        />

        {/* Price Badge Overlay */}
        <View style={[styles.priceOverlay, { backgroundColor: theme.primary }]}>
          <Text style={styles.priceText}>{item.price} {item.currency === 'EUR' ? '€' : item.currency}</Text>
        </View>

        {/* New Item Badge */}
        {item.isNew && (
          <View style={[styles.newBadge, { backgroundColor: theme.secondary }]}>
            <Sparkles size={10} color="#FFFFFF" />
            <Text style={styles.newBadgeText}>NUEVO</Text>
          </View>
        )}
      </View>

      {/* Details Area */}
      <View style={styles.detailsContainer}>
        <View style={styles.topRow}>
          {/* Bot Tag */}
          <View style={[styles.botTag, { backgroundColor: theme.badgeBg }]}>
            <Tag size={10} color={theme.badgeText} />
            <Text style={[styles.botTagText, { color: theme.badgeText }]} numberOfLines={1}>
              {item.botName || 'Bot'}
            </Text>
          </View>

          {/* Timestamp */}
          <View style={styles.timeRow}>
            <Clock size={10} color={theme.textMuted} />
            <Text style={[styles.timeText, { color: theme.textMuted }]}>{formatTime(item.createdAt)}</Text>
          </View>
        </View>

        {/* Item Title */}
        <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Card Footer Actions */}
        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.openLinkRow} onPress={handleOpenUrl}>
            <Text style={[styles.openLinkText, { color: theme.primary }]}>Ver Oferta en Wallapop</Text>
            <ExternalLink size={13} color={theme.primary} />
          </TouchableOpacity>

          {onDelete && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              style={styles.deleteBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Trash2 size={14} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
    alignItems: 'center',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  imageWrapper: {
    position: 'relative',
    width: 90,
    height: 90,
    borderRadius: 10,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  priceOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  newBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'space-between',
    height: 90,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  botTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
    maxWidth: '60%',
  },
  botTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  timeText: {
    fontSize: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    marginVertical: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  openLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  openLinkText: {
    fontSize: 11,
    fontWeight: '700',
  },
  searchSimBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  searchSimText: {
    fontSize: 10,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 4,
  },
});
