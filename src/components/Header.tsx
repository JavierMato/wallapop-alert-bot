import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemeColors } from '../theme/colors';

interface HeaderProps {
  title: string;
  subtitle?: string;
  theme: ThemeColors;
  rightAction?: {
    icon: React.ReactNode;
    onPress: () => void;
    label?: string;
  };
  badgeCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  theme,
  rightAction,
  badgeCount,
}) => {
  return (
    <View style={[styles.headerContainer, { backgroundColor: theme.surface, borderBottomColor: theme.surfaceBorder }]}>
      <View style={styles.titleArea}>
        <View style={styles.row}>
          <Text style={[styles.titleText, { color: theme.textPrimary }]}>{title}</Text>
          {badgeCount !== undefined && badgeCount > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.primary }]}>
              <Text style={styles.badgeText}>{badgeCount}</Text>
            </View>
          )}
        </View>
        {subtitle ? (
          <Text style={[styles.subtitleText, { color: theme.textSecondary }]}>{subtitle}</Text>
        ) : null}
      </View>

      {rightAction && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.badgeBg, borderColor: theme.primary }]}
          onPress={rightAction.onPress}
          activeOpacity={0.8}
        >
          {rightAction.icon}
          {rightAction.label && (
            <Text style={[styles.actionLabel, { color: theme.primary }]}>{rightAction.label}</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleArea: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '400',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
