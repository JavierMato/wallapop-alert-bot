export const palette = {
  primary: '#13C1AC', // Wallapop Teal Accent
  primaryDark: '#0FA391',
  primaryLight: '#E6FAF7',
  secondary: '#FF6B6B',
  accentGold: '#FFB800',
  accentBlue: '#3B82F6',

  // Dark Theme Colors
  darkBackground: '#0F172A',
  darkSurface: '#1E293B',
  darkSurfaceBorder: '#334155',
  darkTextPrimary: '#F8FAFC',
  darkTextSecondary: '#94A3B8',
  darkTextMuted: '#64748B',
  darkCardBg: 'rgba(30, 41, 59, 0.85)',
  darkBadgeBg: '#0F2925',
  darkBadgeText: '#13C1AC',

  // Light Theme Colors
  lightBackground: '#F8FAFC',
  lightSurface: '#FFFFFF',
  lightSurfaceBorder: '#E2E8F0',
  lightTextPrimary: '#0F172A',
  lightTextSecondary: '#475569',
  lightTextMuted: '#94A3B8',
  lightCardBg: '#FFFFFF',
  lightBadgeBg: '#E6FAF7',
  lightBadgeText: '#0FA391',

  // Status
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  cardBg: string;
  badgeBg: string;
  badgeText: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
}

export const darkTheme: ThemeColors = {
  background: palette.darkBackground,
  surface: palette.darkSurface,
  surfaceBorder: palette.darkSurfaceBorder,
  textPrimary: palette.darkTextPrimary,
  textSecondary: palette.darkTextSecondary,
  textMuted: palette.darkTextMuted,
  cardBg: palette.darkCardBg,
  badgeBg: palette.darkBadgeBg,
  badgeText: palette.darkBadgeText,
  primary: palette.primary,
  primaryDark: palette.primaryDark,
  primaryLight: palette.primaryLight,
  secondary: palette.secondary,
  success: palette.success,
  danger: palette.danger,
  warning: palette.warning,
  info: palette.info,
};

export const lightTheme: ThemeColors = {
  background: palette.lightBackground,
  surface: palette.lightSurface,
  surfaceBorder: palette.lightSurfaceBorder,
  textPrimary: palette.lightTextPrimary,
  textSecondary: palette.lightTextSecondary,
  textMuted: palette.lightTextMuted,
  cardBg: palette.lightCardBg,
  badgeBg: palette.lightBadgeBg,
  badgeText: palette.lightBadgeText,
  primary: palette.primary,
  primaryDark: palette.primaryDark,
  primaryLight: palette.primaryLight,
  secondary: palette.secondary,
  success: palette.success,
  danger: palette.danger,
  warning: palette.warning,
  info: palette.info,
};
