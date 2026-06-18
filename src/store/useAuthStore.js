import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { fetchMe } from '../services/endpoints';

const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  loading: true,

  initialize: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      set({ session });

      if (session) {
        await get().fetchUserProfile();
      } else {
        set({ loading: false });
      }

      supabase.auth.onAuthStateChange(async (_event, session) => {
        set({ session });
        if (session) {
          await get().fetchUserProfile();
        } else {
          set({ user: null, loading: false });
        }
      });
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({ loading: false });
    }
  },

  fetchUserProfile: async () => {
    try {
      const user = await fetchMe();
      set({ user, loading: false });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      set({ loading: false });
    }
  },

  signInWithGoogle: async () => {
    // ใช้ window.location.origin ตรงๆ (เช่น http://localhost:5173) 
    // และใส่ console.log เพื่อให้คุณตรวจสอบได้ง่ายว่าส่ง URL อะไรไปที่ Supabase
    const redirectUrl = window.location.origin;
    console.log("Supabase OAuth Redirect URL:", redirectUrl);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl },
    });
    if (error) throw error;
  },

  signUpWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  },

  signInWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  isModerator: () => {
    const role = get().user?.role;
    return role === 'MODERATOR' || role === 'ADMIN';
  },

  isAdmin: () => get().user?.role === 'ADMIN',
}));

export default useAuthStore;
