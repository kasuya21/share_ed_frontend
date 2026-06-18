import { create } from 'zustand';
import { fetchMilestones, claimMilestoneReward } from '../services/endpoints';
import toast from 'react-hot-toast';

const useMilestoneStore = create((set, get) => ({
  milestones: [],
  loading: false,

  fetchMilestones: async () => {
    try {
      set({ loading: true });
      const data = await fetchMilestones();
      set({ milestones: data || [], loading: false });
    } catch (error) {
      console.error('Failed to fetch milestones:', error);
      set({ loading: false });
    }
  },

  claimReward: async (milestoneId) => {
    try {
      await claimMilestoneReward(milestoneId);
      toast.success('Reward claimed successfully!');
      // Re-fetch to update progress and UI
      await get().fetchMilestones();
    } catch (error) {
      console.error('Failed to claim milestone:', error);
      toast.error(error.response?.data?.message || 'Failed to claim reward');
    }
  },

}));

export default useMilestoneStore;
