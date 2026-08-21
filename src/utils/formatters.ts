/**
 * Formats check interval minutes into a human-readable Spanish string.
 * Examples:
 * - 60 -> "1 h"
 * - 360 -> "6 h"
 * - 1440 -> "1 día"
 * - 4320 -> "3 días"
 * - 10080 -> "1 semana"
 */
export const formatIntervalLabel = (minutes?: number): string => {
  if (!minutes) return '1 h';
  if (minutes >= 10080) {
    const weeks = Math.round(minutes / 10080);
    return `${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
  }
  if (minutes >= 1440) {
    const days = Math.round(minutes / 1440);
    return `${days} ${days === 1 ? 'día' : 'días'}`;
  }
  if (minutes >= 60) {
    const hours = Math.round(minutes / 60);
    return `${hours} h`;
  }
  return `${minutes} min`;
};
