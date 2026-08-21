import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { BotConfig, WallapopItem } from '../types/bot';
import { ThemeColors } from '../theme/colors';
import { Header } from '../components/Header';
import { BotCard } from '../components/BotCard';
import { BotFormModal } from '../components/BotFormModal';
import { Plus, Play, Search, Bot as BotIcon, RefreshCw, Zap } from 'lucide-react-native';

interface BotsScreenProps {
  bots: BotConfig[];
  items: WallapopItem[];
  theme: ThemeColors;
  isSearching: boolean;
  statusMessage: string | null;
  onToggleBot: (id: string) => void;
  onRunSearchForBot: (id: string) => void;
  onRunSearchForAll: () => void;
  onSaveBot: (botData: Omit<BotConfig, 'id' | 'createdAt' | 'foundItemsCount'> & { id?: string }) => void;
  onDeleteBot: (id: string) => void;
}

export const BotsScreen: React.FC<BotsScreenProps> = ({
  bots,
  items,
  theme,
  isSearching,
  statusMessage,
  onToggleBot,
  onRunSearchForBot,
  onRunSearchForAll,
  onSaveBot,
  onDeleteBot,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBot, setEditingBot] = useState<BotConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const activeBotsCount = bots.filter((b) => b.enabled).length;
  const totalFoundCount = items.length;

  const filteredBots = bots.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.keywords.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNew = () => {
    setEditingBot(null);
    setModalVisible(true);
  };

  const handleEdit = (bot: BotConfig) => {
    setEditingBot(bot);
    setModalVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* App Header */}
      <Header
        title="Mis Bots de Alerta"
        subtitle={`${activeBotsCount} de ${bots.length} bots activos`}
        theme={theme}
        rightAction={{
          icon: isSearching ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <RefreshCw size={16} color={theme.primary} />
          ),
          label: isSearching ? 'Buscando...' : 'Buscar Todo',
          onPress: onRunSearchForAll,
        }}
      />

      {/* Status Message Banner */}
      {statusMessage ? (
        <View style={[styles.banner, { backgroundColor: theme.badgeBg, borderColor: theme.primary }]}>
          <Zap size={14} color={theme.primary} />
          <Text style={[styles.bannerText, { color: theme.primary }]} numberOfLines={2}>
            {statusMessage}
          </Text>
        </View>
      ) : null}

      {/* Summary Metrics Bar */}
      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { backgroundColor: theme.cardBg, borderColor: theme.surfaceBorder }]}>
          <Text style={[styles.metricValue, { color: theme.primary }]}>{activeBotsCount}</Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Bots Activos</Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: theme.cardBg, borderColor: theme.surfaceBorder }]}>
          <Text style={[styles.metricValue, { color: theme.secondary }]}>{totalFoundCount}</Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Chollos Vistos</Text>
        </View>

        <TouchableOpacity
          style={[styles.globalRunBtn, { backgroundColor: theme.primary }]}
          onPress={onRunSearchForAll}
          disabled={isSearching}
          activeOpacity={0.8}
        >
          {isSearching ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.globalRunText}>Ejecutar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Filter / Search Bar */}
      {bots.length > 0 && (
        <View style={styles.searchBarWrapper}>
          <View style={[styles.searchBar, { backgroundColor: theme.cardBg, borderColor: theme.surfaceBorder }]}>
            <Search size={16} color={theme.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary }]}
              placeholder="Filtrar por nombre o palabras clave..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      )}

      {/* Bots FlatList */}
      <FlatList
        data={filteredBots}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BotCard
            bot={item}
            theme={theme}
            onToggle={onToggleBot}
            onRunNow={onRunSearchForBot}
            onEdit={handleEdit}
            onDelete={onDeleteBot}
            isSearching={isSearching}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <BotIcon size={48} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              {searchQuery ? 'No hay bots que coincidan con la búsqueda' : 'No tienes bots configurados'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Crea tu primer bot para empezar a rastrear ofertas en Wallapop de forma automática.
            </Text>
            <TouchableOpacity
              style={[styles.createFirstBtn, { backgroundColor: theme.primary }]}
              onPress={handleCreateNew}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.createFirstText}>Crear Bot de Alerta</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={handleCreateNew}
        activeOpacity={0.85}
      >
        <Plus size={26} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Bot Form Modal */}
      <BotFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={onSaveBot}
        initialBot={editingBot}
        theme={theme}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  globalRunBtn: {
    flex: 1.2,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  globalRunText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  searchBarWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
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
    paddingTop: 8,
    paddingBottom: 90,
  },
  emptyContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
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
  createFirstBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  createFirstText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});
