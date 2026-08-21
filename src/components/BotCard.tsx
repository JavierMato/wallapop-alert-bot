import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { BotConfig } from '../types/bot';
import { ThemeColors } from '../theme/colors';
import { Play, Edit3, Trash2, Tag, MapPin, DollarSign, Clock, Zap } from 'lucide-react-native';
import { formatIntervalLabel } from '../utils/formatters';

interface BotCardProps {
  bot: BotConfig;
  theme: ThemeColors;
  onToggle: (id: string) => void;
  onRunNow: (id: string) => void;
  onEdit: (bot: BotConfig) => void;
  onDelete: (id: string) => void;
  isSearching?: boolean;
}

export const BotCard: React.FC<BotCardProps> = ({
  bot,
  theme,
  onToggle,
  onRunNow,
  onEdit,
  onDelete,
  isSearching = false,
}) => {
  const formatTimeAgo = (isoDate?: string) => {
    if (!isoDate) return 'Nunca ejecutado';
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diffMs / (1000 * 60));
    if (mins < 1) return 'Hace un momento';
    if (mins < 60) return `Hace ${mins} m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours} h`;
    return `Hace ${Math.floor(hours / 24)} d`;
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Eliminar Bot',
      `¿Estás seguro de eliminar el bot "${bot.name}"? Se borrarán sus alertas guardadas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => onDelete(bot.id) },
      ]
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.surfaceBorder }]}>
      {/* Top Header */}
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <View style={[styles.statusDot, { backgroundColor: bot.enabled ? theme.primary : theme.textMuted }]} />
          <Text style={[styles.botName, { color: theme.textPrimary }]} numberOfLines={1}>
            {bot.name}
          </Text>
        </View>
        <Switch
          value={bot.enabled}
          onValueChange={() => onToggle(bot.id)}
          trackColor={{ false: theme.surfaceBorder, true: theme.primaryLight }}
          thumbColor={bot.enabled ? theme.primary : theme.textMuted}
        />
      </View>

      {/* Keywords Pill */}
      <View style={[styles.keywordPill, { backgroundColor: theme.surface }]}>
        <Tag size={14} color={theme.primary} />
        <Text style={[styles.keywordText, { color: theme.textPrimary }]} numberOfLines={1}>
          "{bot.keywords}"
        </Text>
      </View>

      {/* Filter Badges Row */}
      <View style={styles.filtersRow}>
        {(bot.minPrice !== undefined || bot.maxPrice !== undefined) && (
          <View style={[styles.filterBadge, { backgroundColor: theme.surface }]}>
            <DollarSign size={12} color={theme.textSecondary} />
            <Text style={[styles.filterText, { color: theme.textSecondary }]}>
              {bot.minPrice ?? 0}€ - {bot.maxPrice ? `${bot.maxPrice}€` : 'Sin máx'}
            </Text>
          </View>
        )}

        {bot.city && (
          <View style={[styles.filterBadge, { backgroundColor: theme.surface }]}>
            <MapPin size={12} color={theme.textSecondary} />
            <Text style={[styles.filterText, { color: theme.textSecondary }]}>
              {bot.city} {bot.distance ? `(${bot.distance}km)` : ''}
            </Text>
          </View>
        )}

        <View style={[styles.filterBadge, { backgroundColor: theme.surface }]}>
          <Clock size={12} color={theme.textSecondary} />
          <Text style={[styles.filterText, { color: theme.textSecondary }]}>
            {formatIntervalLabel(bot.checkIntervalMinutes)}
          </Text>
        </View>
      </View>

      {/* Footer Info */}
      <View style={[styles.footerRow, { borderTopColor: theme.surfaceBorder }]}>
        <View style={styles.statsCol}>
          <Text style={[styles.lastRunText, { color: theme.textMuted }]}>
            Última ejec: {formatTimeAgo(bot.lastRun)}
          </Text>
          <View style={styles.dealsFoundBadge}>
            <Zap size={12} color={theme.primary} />
            <Text style={[styles.dealsFoundText, { color: theme.primary }]}>
              {bot.foundItemsCount || 0} chollos hallados
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsGroup}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.badgeBg, borderColor: theme.primary }]}
            onPress={() => onRunNow(bot.id)}
            disabled={isSearching}
            activeOpacity={0.7}
          >
            <Play size={14} color={theme.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
            onPress={() => onEdit(bot)}
            activeOpacity={0.7}
          >
            <Edit3 size={14} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.danger + '33' }]}
            onPress={handleDeletePress}
            activeOpacity={0.7}
          >
            <Trash2 size={14} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  botName: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  keywordPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    marginBottom: 10,
  },
  keywordText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '500',
  },
  footerRow: {
    borderTopWidth: 1,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsCol: {
    gap: 2,
  },
  lastRunText: {
    fontSize: 11,
  },
  dealsFoundBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dealsFoundText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionsGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
