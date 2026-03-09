import api from '../lib/api';

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data) => api.put('/auth/update-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getUserById: (id) => api.get(`/users/${id}`),
  deleteAccount: () => api.delete('/users/account'),
};

// Freelancer APIs
export const freelancerAPI = {
  createOrUpdateProfile: (data) => api.post('/freelancers/profile', data),
  getMyProfile: () => api.get('/freelancers/me/profile'),
  getFreelancers: (params) => api.get('/freelancers', { params }),
  getFreelancerById: (id) => api.get(`/freelancers/${id}`),
  getFeatured: () => api.get('/freelancers/featured'),
  getTopRated: () => api.get('/freelancers/top-rated'),
  saveJob: (jobId) => api.post(`/freelancers/saved-jobs/${jobId}`),
  unsaveJob: (jobId) => api.delete(`/freelancers/saved-jobs/${jobId}`),
  getSavedJobs: (params) => api.get('/freelancers/saved-jobs', { params }),
  checkJobSaved: (jobId) => api.get(`/freelancers/saved-jobs/${jobId}/check`),
};

// Client APIs
export const clientAPI = {
  createOrUpdateProfile: (data) => api.post('/clients/profile', data),
  getMyProfile: () => api.get('/clients/me/profile'),
  getClientById: (id) => api.get(`/clients/${id}`),
  getAnalytics: () => api.get('/clients/analytics/dashboard'),
};

// Job APIs
export const jobAPI = {
  createJob: (data) => api.post('/jobs', data),
  getJobs: (params) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getMyJobs: (params) => api.get('/jobs/my/posted', { params }),
  closeJob: (id) => api.put(`/jobs/${id}/close`),
  updateJobStatus: (id, data) => api.put(`/jobs/${id}/status`, data),
};

// Proposal APIs
export const proposalAPI = {
  createProposal: (data) => api.post('/proposals', data),
  getJobProposals: (jobId) => api.get(`/proposals/job/${jobId}`),
  getMyProposals: (params) => api.get('/proposals/my/submitted', { params }),
  getReceivedProposals: (params) => api.get('/proposals/received/all', { params }),
  getProposalById: (id) => api.get(`/proposals/${id}`),
  updateProposal: (id, data) => api.put(`/proposals/${id}`, data),
  withdrawProposal: (id) => api.put(`/proposals/${id}/withdraw`),
  acceptProposal: (id) => api.put(`/proposals/${id}/accept`),
  rejectProposal: (id) => api.put(`/proposals/${id}/reject`),
  getUnreadCount: () => api.get('/proposals/unread-count'),
};

// Contract APIs
export const contractAPI = {
  createContract: (data) => api.post('/contracts', data),
  getMyContracts: (params) => api.get('/contracts/my', { params }),
  getContractById: (id) => api.get(`/contracts/${id}`),
  updateContract: (id, data) => api.put(`/contracts/${id}`, data),
  submitWork: (id, data) => api.post(`/contracts/${id}/submit`, data),
  completeContract: (id) => api.put(`/contracts/${id}/complete`),
};

// Payment APIs
export const paymentAPI = {
  createPayment: (data) => api.post('/payments', data),
  releasePayment: (id) => api.post(`/payments/${id}/release`),
  getMyPayments: (params) => api.get('/payments/my', { params }),
  getPaymentById: (id) => api.get(`/payments/${id}`),
  getPaymentStats: () => api.get('/payments/stats/summary'),
  getEarningsByMonth: (months = 6) => api.get('/payments/stats/earnings', { params: { months } }),
};

// Message APIs
export const messageAPI = {
  sendMessage: (data) => api.post('/messages', data),
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (conversationId, params) => api.get(`/messages/conversation/${conversationId}`, { params }),
  markAsRead: (id) => api.put(`/messages/${id}/read`),
  deleteMessage: (id) => api.delete(`/messages/${id}`),
};

export const chatAPI = {
  getChats: () => api.get('/chats'),
  getContractMessages: (contractId) => api.get(`/chats/${contractId}/messages`),
  sendContractMessage: (contractId, data) => api.post(`/chats/${contractId}/messages`, data),
};

// Review APIs
export const reviewAPI = {
  createReview: (data) => api.post('/reviews', data),
  getUserReviews: (userId, params) => api.get(`/reviews/user/${userId}`, { params }),
  getMyReviews: () => api.get('/reviews/my/received'),
  respondToReview: (id, data) => api.post(`/reviews/${id}/respond`, data),
  markAsHelpful: (id) => api.post(`/reviews/${id}/helpful`),
};

// Notification APIs
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// Admin APIs
export const adminAPI = {
  // Authentication
  login: (credentials) => api.post('/admin/login', credentials),
  
  // Dashboard & Statistics
  getStats: () => api.get('/admin/stats'),
  getPlatformStats: () => api.get('/admin/stats'),
  getRecentActivity: (params) => api.get('/admin/activity', { params }),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  
  // User Management (Full CRUD)
  getUsers: (params) => api.get('/admin/users', { params }),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  // Job Management (Full CRUD)
  getAllJobs: (params) => api.get('/admin/jobs', { params }),
  getJobById: (id) => api.get(`/admin/jobs/${id}`),
  createJob: (data) => api.post('/admin/jobs', data),
  updateJob: (id, data) => api.put(`/admin/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
  flagJob: (id, data) => api.put(`/admin/jobs/${id}/flag`, data),
  
  // Proposal Management (Full CRUD)
  getAllProposals: (params) => api.get('/admin/proposals', { params }),
  updateProposal: (id, data) => api.put(`/admin/proposals/${id}`, data),
  deleteProposal: (id) => api.delete(`/admin/proposals/${id}`),
  
  // Contract Management (Full CRUD)
  getAllContracts: (params) => api.get('/admin/contracts', { params }),
  updateContract: (id, data) => api.put(`/admin/contracts/${id}`, data),
  updateContractStatus: (id, data) => api.patch(`/admin/contracts/${id}/status`, data),
  
  // Payment Management
  getAllPayments: (params) => api.get('/admin/payments', { params }),
  overridePaymentStatus: (id, data) => api.patch(`/admin/payments/${id}/override`, data),
  
  // Dispute Management
  getAllDisputes: (params) => api.get('/admin/disputes', { params }),
  resolveDispute: (id, data) => api.patch(`/admin/disputes/${id}/resolve`, data),
  
  // Review Management
  getAllReviews: (params) => api.get('/admin/reviews', { params }),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
  
  // Freelancer Management
  toggleFeatured: (id, data) => api.put(`/admin/freelancers/${id}/featured`, data),
  
  // Platform Settings
  getPlatformSettings: () => api.get('/admin/settings'),
  
  // Notifications & Broadcasts
  broadcastNotification: (data) => api.post('/admin/notifications/broadcast', data)
};

