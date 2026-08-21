import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { BotConfig, WallapopItem } from '../types/bot';
import { ThemeColors } from '../theme/colors';
import { Header } from '../components/Header';
import { ItemCard } from '../components/ItemCard';
import { CheckCheck, Search, BellOff, Sparkles } from 'lucide-react-native';

interface AlertsScreenProps {
  items: WallapopItem[];
  bots: BotConfig[];
  theme: ThemeColors;
  onMarkAllAsRead: () => void;
  onDeleteItem: (id: string) => void;
}

export const AlertsScreen: React.FC<AlertsScreenProps> = ({
  items,
  bots,
  theme,
  onMarkAllAsRead,
  onDeleteItem,
}) => {
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = items.filter((i) => i.isNew).length;

  // Filter items by selected bot & search query
  const filteredItems = items
    .filter((item) => {
      if (selectedBotId && item.botId !== selectedBotId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          (item.botName && item.botName.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <Header
        title="Alertas & Chollos"
        subtitle={`${items.length} anuncios guardados`}
        theme={theme}
        badgeCount={unreadCount}
        rightAction={{
          icon: <CheckCheck size={16} color={theme.primary} />,
          label: 'Marcar Leídos',
          onPress: onMarkAllAsRead,
        }}
      />

      {/* Bot Filter Chips ScrollView */}
      <View style={[styles.filterBar, { borderBottomColor: theme.surfaceBorder }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          <TouchableOpacity
            style={[
              styles.chip,
              {
                backgroundColor: selectedBotId === null ? theme.primary : theme.cardBg,
                borderColor: selectedBotId === null ? theme.primary : theme.surfaceBorder,
              },
            ]}
            onPress={() => setSelectedBotId(null)}
          >
            <Text
              style={[
                styles.chipText,
                { color: selectedBotId === null ? '#FFFFFF' : theme.textPrimary },
              ]}
            >
              Todos ({items.length})
            </Text>
          </TouchableOpacity>

          {bots.map((bot) => {
            const count = items.filter((i) => i.botId === bot.id).length;
            const isSelected = selectedBotId === bot.id;
            return (
              <TouchableOpacity
                key={bot.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.cardBg,
                    borderColor: isSelected ? theme.primary : theme.surfaceBorder,
                  },
                ]}
                onPress={() => setSelectedBotId(bot.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                  ]}
                >
                  {bot.name} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Search Input Bar */}
      {items.length > 0 && (
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: theme.cardBg, borderColor: theme.surfaceBorder }]}>
            <Search size={16} color={theme.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary }]}
              placeholder="Buscar en anuncios capturados..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      )}

      {/* Items FlatList */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItemCard item={item} theme={theme} onDelete={onDeleteItem} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <BellOff size={44} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              {searchQuery || selectedBotId
                ? 'No se encontraron chollos para esta búsqueda'
                : 'No hay alertas registradas'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Los nuevos anuncios detectados por tus bots de Wallapop aparecerán en esta pantalla.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterBar: {
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  emptyContainer: {
    paddingTop: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 14,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
