import api from './api';
import { unwrapData } from '../lib/apiHelpers';

// ——— Auth & users ———
export const fetchMe = () => api.get('/auth/me').then(unwrapData);

export const fetchUserProfile = (id) =>
  api.get(`/users/${id}`).then(unwrapData);

export const updateUserProfile = (formData) =>
  api.put('/users/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const onboardUser = (payload) => api.put('/users/onboard', payload);

export const equipUserItem = (itemId, type) =>
  api.put('/users/equip', { itemId, type });

// ——— Posts ———
export const fetchPosts = (params = {}) =>
  api.get('/posts', { params }).then(unwrapData);

export const fetchTrendingPosts = () =>
  api.get('/posts/trending').then(unwrapData);

export const fetchPlatformStats = () =>
  api.get('/posts/stats').then(unwrapData);

export const fetchMostLikedPosts = () =>
  api.get('/posts/most-liked').then(unwrapData);

export const fetchPost = (id) => api.get(`/posts/${id}`).then(unwrapData);

export const fetchMyPosts = () =>
  api.get('/posts/user/my-posts').then(unwrapData);

export const createPost = (payload) => api.post('/posts', payload);

export const updatePost = (id, payload) => api.put(`/posts/${id}`, payload);

export const deletePost = (id) => api.delete(`/posts/${id}`);

// ——— Engagement ———
export const toggleLike = (postId) => api.post(`/likes/${postId}`);

export const toggleBookmark = (postId) => api.post(`/bookmarks/${postId}`);

export const fetchBookmarks = () => api.get('/bookmarks').then(unwrapData);

export const followUser = (userId) => api.post(`/follow/${userId}`);

export const unfollowUser = (userId) => api.delete(`/follow/${userId}`);

// ——— Comments ———
export const fetchComments = (postId) =>
  api.get(`/comment/post/${postId}`).then(unwrapData);

export const createComment = (postId, content) =>
  api.post('/comment', { post_id: postId, content });

export const updateComment = (id, content) =>
  api.put(`/comment/${id}`, { content });

export const deleteComment = (id) => api.delete(`/comment/${id}`);

// ——— Notifications ———
export const fetchNotifications = () =>
  api.get('/notifications').then(unwrapData);

export const markNotificationRead = (id) =>
  api.patch(`/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  api.patch('/notifications/read-all');

export const deleteNotification = (id) => api.delete(`/notifications/${id}`);

// ——— Milestones ———
export const fetchMilestones = () => api.get('/milestones').then(unwrapData);

export const claimMilestoneReward = (milestoneId) =>
  api.post(`/milestones/${milestoneId}/claim`);

// ——— Admin / moderator ———
export const fetchModeratorPosts = () =>
  api.get('/moderator/reports').then((r) => r.data?.posts ?? r.data);

export const moderatorPostAction = (postId, action) =>
  api.post(`/moderator/posts/${postId}/action`, { action });

export const fetchAdminUsers = () => api.get('/admin/users').then(unwrapData);

export const changeUserRole = (id, role) =>
  api.patch(`/admin/users/${id}/role`, { role });

export const banUser = (id, reason) =>
  api.patch(`/admin/users/${id}/ban`, { reason });

export const unbanUser = (id) =>
  api.patch(`/admin/users/${id}/unban`);
