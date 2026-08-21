import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { storageService } from './storageService';
import { wallapopService } from './wallapopService';

export const BACKGROUND_WALLAPOP_TASK = 'BACKGROUND_WALLAPOP_SEARCH_TASK';

// Define background task
TaskManager.defineTask(BACKGROUND_WALLAPOP_TASK, async () => {
  try {
    const bots = await storageService.getBots();
    const activeBots = bots.filter((b) => b.enabled);

    if (activeBots.length === 0) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    let totalNewDeals = 0;
    for (const bot of activeBots) {
      const result = await wallapopService.executeBotSearch(bot);
      totalNewDeals += result.newItemsCount;
    }

    if (totalNewDeals > 0) {
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }
    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('Background fetch execution error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const backgroundService = {
  /**
   * Register background task for Expo app
   */
  async registerBackgroundTask(): Promise<boolean> {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_WALLAPOP_TASK);
      if (!isRegistered) {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_WALLAPOP_TASK, {
          minimumInterval: 15 * 60, // 15 minutes minimum interval for Expo
          stopOnTerminate: false,
          startOnBoot: true,
        });
        console.log('Background fetch task registered successfully.');
      }
      return true;
    } catch (err) {
      console.warn('Failed to register background fetch task (might require standalone build):', err);
      return false;
    }
  },

  /**
   * Unregister background task
   */
  async unregisterBackgroundTask(): Promise<void> {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_WALLAPOP_TASK);
      if (isRegistered) {
        await BackgroundFetch.unregisterTaskAsync(BACKGROUND_WALLAPOP_TASK);
        console.log('Background fetch task unregistered.');
      }
    } catch (err) {
      console.error('Failed to unregister background task:', err);
    }
  },

  /**
   * Check status of background task
   */
  async getStatus(): Promise<{ registered: boolean; status: BackgroundFetch.BackgroundFetchStatus | null }> {
    try {
      const status = await BackgroundFetch.getStatusAsync();
      const registered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_WALLAPOP_TASK);
      return { registered, status };
    } catch (err) {
      return { registered: false, status: null };
    }
  },
};
