import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { AppSettings } from '../types/bot';
import { ThemeColors } from '../theme/colors';
import { Header } from '../components/Header';
import { wallapopService } from '../services/wallapopService';
import { backgroundService } from '../services/backgroundService';
import {
  Moon,
  Sun,
  RefreshCw,
  Database,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  Info,
  Globe,
} from 'lucide-react-native';

interface SettingsScreenProps {
  settings: AppSettings;
  theme: ThemeColors;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onSeedDemoData: () => void;
  onClearAllData: () => void;
  onTestApi?: () => Promise<any>;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  theme,
  onUpdateSettings,
  onSeedDemoData,
  onClearAllData,
  onTestApi,
}) => {
  const [testingApi, setTestingApi] = useState(false);
  const [apiResult, setApiResult] = useState<{ status: string; ok: boolean } | null>(null);

  const handleTestWallapopApi = async () => {
    setTestingApi(true);
    setApiResult(null);

    try {
      let result;
      if (onTestApi) {
        result = await onTestApi();
      } else {
        const testBot = {
          id: 'test_bot',
          name: 'Prueba API',
          enabled: true,
          keywords: 'bicicleta',
          checkIntervalMinutes: 10,
          foundItemsCount: 0,
          createdAt: new Date().toISOString(),
        };
        result = await wallapopService.executeBotSearch(testBot);
      }

      if (result && result.success) {
        const addedMsg = result.newItemsCount > 0 ? ` (${result.newItemsCount} nuevos añadidos a Alertas)` : ' (ya estaban guardados)';
        setApiResult({
          status: `Respuesta exitosa de Wallapop. ${result.totalFetched} anuncios obtenidos${addedMsg}.`,
          ok: true,
        });
      } else {
        setApiResult({
          status: result?.error || 'No se obtuvieron datos de la API',
          ok: false,
        });
      }
    } catch (e: any) {
      setApiResult({
        status: `Error: ${e?.message || 'Error al conectar'}`,
        ok: false,
      });
    } finally {
      setTestingApi(false);
    }
  };

  const handleClearDataConfirm = () => {
    Alert.alert(
      'Restablecer Aplicación',
      '¿Estás seguro de borrar todos los bots, alertas e historial? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Borrar Todo', style: 'destructive', onPress: onClearAllData },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Ajustes de la App" theme={theme} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section 1: Appearance & Theme */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>APARIENCIA Y TEMA</Text>
        <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.surfaceBorder }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLabelRow}>
              {settings.themeMode === 'dark' ? (
                <Moon size={20} color={theme.primary} />
              ) : (
                <Sun size={20} color={theme.warning} />
              )}
              <View>
                <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Modo Oscuro (Dark Mode)</Text>
                <Text style={[styles.settingSubtitle, { color: theme.textMuted }]}>
                  {settings.themeMode === 'dark' ? 'Activado' : 'Desactivado'}
                </Text>
              </View>
            </View>

            <Switch
              value={settings.themeMode === 'dark'}
              onValueChange={(isDark) => onUpdateSettings({ themeMode: isDark ? 'dark' : 'light' })}
              trackColor={{ false: theme.surfaceBorder, true: theme.primaryLight }}
              thumbColor={settings.themeMode === 'dark' ? theme.primary : theme.textMuted}
            />
          </View>
        </View>

        {/* Section 2: Monitoring & Background */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>MONITORIZACIÓN Y POLLING</Text>
        <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.surfaceBorder }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLabelRow}>
              <RefreshCw size={20} color={theme.primary} />
              <View style={styles.textWrap}>
                <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Búsqueda Automática</Text>
                <Text style={[styles.settingSubtitle, { color: theme.textMuted }]}>
                  Ejecutar rastreo en primer plano según intervalo de cada bot
                </Text>
              </View>
            </View>

            <Switch
              value={settings.autoRefreshEnabled}
              onValueChange={(val) => onUpdateSettings({ autoRefreshEnabled: val })}
              trackColor={{ false: theme.surfaceBorder, true: theme.primaryLight }}
              thumbColor={settings.autoRefreshEnabled ? theme.primary : theme.textMuted}
            />
          </View>
        </View>

        {/* Section 3: Diagnostic Tools & Demo */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>DIAGNÓSTICO Y PRUEBAS</Text>
        <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.surfaceBorder }]}>
          {/* Wallapop API Test */}
          <TouchableOpacity style={styles.actionRow} onPress={handleTestWallapopApi} disabled={testingApi}>
            <View style={styles.settingLabelRow}>
              <Globe size={20} color={theme.primary} />
              <View style={styles.textWrap}>
                <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Probar API de Wallapop</Text>
                <Text style={[styles.settingSubtitle, { color: theme.textMuted }]}>
                  Endpoint: https://api.wallapop.com/api/v3/general/search
                </Text>
              </View>
            </View>
            {testingApi ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <Globe size={16} color={theme.textMuted} />
            )}
          </TouchableOpacity>

          {apiResult && (
            <View style={[styles.apiResultBox, { backgroundColor: apiResult.ok ? theme.badgeBg : theme.danger + '1A' }]}>
              {apiResult.ok ? (
                <CheckCircle2 size={16} color={theme.success} />
              ) : (
                <XCircle size={16} color={theme.danger} />
              )}
              <Text style={[styles.apiResultText, { color: apiResult.ok ? theme.primary : theme.danger }]}>
                {apiResult.status}
              </Text>
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

          {/* Seed Demo Data */}
          <TouchableOpacity style={styles.actionRow} onPress={onSeedDemoData}>
            <View style={styles.settingLabelRow}>
              <Sparkles size={20} color={theme.secondary} />
              <View style={styles.textWrap}>
                <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Cargar Chollos Demo</Text>
                <Text style={[styles.settingSubtitle, { color: theme.textMuted }]}>
                  Generar bots e historial de chollos para probar la UI
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

          {/* Clear Storage */}
          <TouchableOpacity style={styles.actionRow} onPress={handleClearDataConfirm}>
            <View style={styles.settingLabelRow}>
              <Trash2 size={20} color={theme.danger} />
              <View style={styles.textWrap}>
                <Text style={[styles.settingTitle, { color: theme.danger }]}>Restablecer Datos</Text>
                <Text style={[styles.settingSubtitle, { color: theme.textMuted }]}>
                  Borrar bots y almacenamiento local en AsyncStorage
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Section 4: App Information */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>INFORMACIÓN</Text>
        <View style={[styles.card, styles.infoCard, { backgroundColor: theme.cardBg, borderColor: theme.surfaceBorder }]}>
          <Layers size={24} color={theme.primary} />
          <Text style={[styles.infoTitle, { color: theme.textPrimary }]}>Wallapop Alert Bot v1.0.0</Text>
          <Text style={[styles.infoSubtitle, { color: theme.textMuted }]}>
            Desarrollado con React Native, Expo, TypeScript y AsyncStorage.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  textWrap: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  apiResultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  apiResultText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  infoCard: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 40,
  },
});
