import { create } from 'zustand';
import { equipUserItem, fetchMilestones } from '../services/endpoints';
import useAuthStore from './useAuthStore';

const useGamificationStore = create((set, get) => ({
  currentThemeId: 'default',
  currentFrameId: 'none',
  quests: [],
  milestonesCompleted: 0,
  loading: false,

  initialize: (user) => {
    if (user) {
      set({
        currentThemeId: user.current_theme_id || 'default',
        currentFrameId: user.current_frame_id || 'none',
        milestonesCompleted: user.milestones_completed || 0
      });
    }
  },

  fetchQuests: async () => {
    try {
      set({ loading: true });
      const data = await fetchMilestones();
      
      // Map milestones to match quest UI format
      const formattedQuests = (data || []).map(m => ({
        id: m.id,
        quest_name: m.milestone?.title || m.title || 'Unknown Quest',
        current_progress: m.current_progress || 0,
        target_value: m.milestone?.target_value || m.target_value || 10,
      }));
      
      set({ quests: formattedQuests, loading: false });
    } catch (error) {
      console.error('Failed to fetch quests:', error);
      set({ loading: false });
    }
  },

  equipItem: async (itemId, type) => {
    try {
      await equipUserItem(itemId, type);
      if (type === 'THEME') {
        set({ currentThemeId: itemId });
      } else if (type === 'FRAME') {
        set({ currentFrameId: itemId });
      }
      
      // Update the user profile in auth store so it syncs up
      const userStore = useAuthStore.getState();
      if (userStore.fetchUserProfile) {
        await userStore.fetchUserProfile();
      }
    } catch (error) {
      console.error('Failed to equip item:', error);
      throw error;
    }
  },
}));

export default useGamificationStore;
