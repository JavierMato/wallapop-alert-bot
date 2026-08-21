import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useBotPoller } from './src/hooks/useBotPoller';
import { darkTheme, lightTheme } from './src/theme/colors';
import { BotsScreen } from './src/screens/BotsScreen';
import { AlertsScreen } from './src/screens/AlertsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { backgroundService } from './src/services/backgroundService';
import { Bot, Bell, Settings } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export default function App() {
  const {
    bots,
    items,
    settings,
    loading,
    isSearching,
    statusMessage,
    runSearchForAllBots,
    runSearchForBot,
    testApiConnection,
    toggleBot,
    deleteBot,
    saveBot,
    markAllAsRead,
    deleteItem,
    updateSettings,
    seedDemoData,
    clearAllData,
  } = useBotPoller();

  const theme = settings.themeMode === 'dark' ? darkTheme : lightTheme;

  // Register Expo background fetch task
  useEffect(() => {
    backgroundService.registerBackgroundTask();
  }, []);

  const unreadAlertsCount = items.filter((i) => i.isNew).length;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'left', 'right']}>
        <StatusBar style={settings.themeMode === 'dark' ? 'light' : 'dark'} />

        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: theme.surface,
                borderTopColor: theme.surfaceBorder,
                height: 60,
                paddingBottom: 8,
                paddingTop: 8,
              },
              tabBarActiveTintColor: theme.primary,
              tabBarInactiveTintColor: theme.textMuted,
              tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '600',
              },
            }}
          >
            <Tab.Screen
              name="MisBots"
              options={{
                tabBarLabel: 'Mis Bots',
                tabBarIcon: ({ color, size }) => <Bot size={size} color={color} />,
              }}
            >
              {() => (
                <BotsScreen
                  bots={bots}
                  items={items}
                  theme={theme}
                  isSearching={isSearching}
                  statusMessage={statusMessage}
                  onToggleBot={toggleBot}
                  onRunSearchForBot={runSearchForBot}
                  onRunSearchForAll={runSearchForAllBots}
                  onSaveBot={saveBot}
                  onDeleteBot={deleteBot}
                />
              )}
            </Tab.Screen>

            <Tab.Screen
              name="Alertas"
              options={{
                tabBarLabel: 'Alertas',
                tabBarBadge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
                tabBarBadgeStyle: {
                  backgroundColor: theme.primary,
                  color: '#FFFFFF',
                  fontSize: 10,
                  fontWeight: '700',
                },
                tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
              }}
            >
              {() => (
                <AlertsScreen
                  items={items}
                  bots={bots}
                  theme={theme}
                  onMarkAllAsRead={markAllAsRead}
                  onDeleteItem={deleteItem}
                />
              )}
            </Tab.Screen>

            <Tab.Screen
              name="Ajustes"
              options={{
                tabBarLabel: 'Ajustes',
                tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
              }}
            >
              {() => (
                <SettingsScreen
                  settings={settings}
                  theme={theme}
                  onUpdateSettings={updateSettings}
                  onSeedDemoData={seedDemoData}
                  onClearAllData={clearAllData}
                  onTestApi={testApiConnection}
                />
              )}
            </Tab.Screen>
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
