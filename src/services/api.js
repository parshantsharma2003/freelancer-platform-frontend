import api from '../lib/api';

// Auth APIs
export const authAPI = {
  register: (data, config = {}) => api.post('/auth/register', data, config),
  login: (data, config = {}) => api.post('/auth/login', data, config),
  refresh: (config = {}) => api.post('/auth/refresh', {}, config),
  session: (config = {}) => api.get('/auth/session', config),
  logout: (config = {}) => api.post('/auth/logout', {}, config),
  getMe: (config = {}) => api.get('/auth/me', config),
  updatePassword: (data, config = {}) => api.put('/auth/update-password', data, config),
  forgotPassword: (email, config = {}) => api.post('/auth/forgot-password', { email }, config),
  requestEmailVerification: (config = {}) => api.post('/auth/request-email-verification', {}, config),
  verifyEmail: (token, config = {}) => api.post('/auth/verify-email', { token }, config),
  verifyEmailByToken: (token, config = {}) => api.get(`/auth/verify-email/${token}`, config),
  requestPhoneVerification: (config = {}) => api.post('/auth/request-phone-verification', {}, config),
  verifyPhone: (code, config = {}) => api.post('/auth/verify-phone', { code }, config),
  requestLoginOtp: (email, config = {}) => api.post('/auth/request-login-otp', { email }, config),
  verifyLoginOtp: (email, otp, config = {}) => api.post('/auth/verify-login-otp', { email, otp }, config),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getUserById: (id) => api.get(`/users/${id}`),
  deleteAccount: () => api.delete('/users/account'),
  getWalletSummary: () => api.get('/users/wallet'),
  requestWalletWithdrawal: (data) => api.post('/users/wallet/withdraw', data),
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

// Invite APIs
export const inviteAPI = {
  sendJobInvite: (jobId, data) => api.post(`/jobs/${jobId}/invite`, data),
  getMyInvites: (params) => api.get('/invites', { params }),
  getInviteById: (inviteId) => api.get(`/invites/${inviteId}`),
  respondToInvite: (inviteId, data) => api.post(`/invites/${inviteId}/respond`, data),
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
  acceptContract: (id) => api.post(`/contracts/${id}/accept`),
  submitWork: (id, data) => api.post(`/contracts/${id}/submit`, data),
  updateContractStatus: (id, data) => api.patch(`/contracts/${id}/status`, data),
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

// Dispute APIs
export const disputeAPI = {
  raiseDispute: (data) => api.post('/disputes', data),
  getMyDisputes: (params) => api.get('/disputes', { params }),
  getDisputeById: (id) => api.get(`/disputes/${id}`),
  addEvidence: (id, data) => api.post(`/disputes/${id}/evidence`, data)
};

// Message APIs
export const messageAPI = {
  sendMessage: (data) => api.post('/messages', data),
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (conversationId, params) => api.get(`/messages/conversation/${conversationId}`, { params }),
  getDirectMessages: (userId, params) => api.get(`/messages/direct/${userId}`, { params }),
  markAsRead: (id) => api.put(`/messages/${id}/read`),
  deleteMessage: (id) => api.delete(`/messages/${id}`),
};

export const chatAPI = {
  getChats: () => api.get('/chats'),
  getContractMessages: (contractId) => api.get(`/chats/${contractId}/messages`),
  sendContractMessage: (contractId, data) => api.post(`/chats/${contractId}/messages`, data),
};

export const uploadAPI = {
  uploadChatAsset: (data) => api.post('/uploads/chat-asset', data),
  downloadChatFile: (filePath) => {
    // Encode the file path as base64 for safe URL transmission
    const encodedPath = btoa(filePath); // Use btoa for browser compatibility
    return api.get(`/uploads/chat-file/${encodedPath}`, {
      responseType: 'blob'
    });
  }
};

// Review APIs
export const reviewAPI = {
  createReview: (data) => api.post('/reviews', data),
  submitReview: (contractId, data) => api.post(`/reviews/${contractId}/submit`, data),
  getPendingReviews: () => api.get('/reviews/pending'),
  getUserReviews: (userId, params) => api.get(`/reviews/user/${userId}`, { params }),
  getRatingsSummary: (userId) => api.get(`/reviews/ratings/${userId}`),
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
  getPlatformStats: () => api.get('/admin/stats'),
  getRecentActivity: (params) => api.get('/admin/activity', { params }),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  
  // User Management (Full CRUD)
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  updateUserStatus: (id, data) => api.patch(`/admin/users/${id}/status`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  // Job Management (Full CRUD)
  getAllJobs: (params) => api.get('/admin/jobs', { params }),
  getJobById: (id) => api.get(`/admin/jobs/${id}`),
  createJob: (data) => api.post('/admin/jobs', data),
  updateJob: (id, data) => api.put(`/admin/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
  flagJob: (id, reason) =>
    api.patch(`/admin/jobs/${id}/flag`, {
      isFlagged: true,
      reason
    }),
  
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
  toggleFeatured: (id, data) => api.patch(`/admin/freelancers/${id}/featured`, data || {}),
  
  // Platform Settings
  getPlatformSettings: () => api.get('/admin/settings'),
  
  // Notifications & Broadcasts
  broadcastNotification: (data) => api.post('/admin/notifications/broadcast', data)
};

/* -------------------------------- */
/* Milestone API                    */
/* -------------------------------- */

export const milestoneAPI = {

  getMilestones: (params) =>
    api.get("/milestones", { params }),

  createMilestones: (data) =>
    api.post("/milestones", data),

  reorderMilestones: (data) =>
    api.post('/milestones/reorder', data),

  updateMilestone: (milestoneId, data) =>
    api.patch(`/milestones/${milestoneId}`, data),

  deleteMilestone: (milestoneId) =>
    api.delete(`/milestones/${milestoneId}`),

  addAttachment: (milestoneId, data) =>
    api.post(`/milestones/${milestoneId}/attachments`, data),

  addComment: (milestoneId, data) =>
    api.post(`/milestones/${milestoneId}/comments`, data),

  startWork: (milestoneId) =>
    api.post(`/milestones/${milestoneId}/start-work`),

  submitWork: (milestoneId, data) =>
    api.post(`/milestones/${milestoneId}/submit`, data),

  approveMilestone: (milestoneId, data = {}) =>
    api.post(`/milestones/${milestoneId}/approve`, data),

  releasePayment: (milestoneId) =>
    api.post(`/milestones/${milestoneId}/release-payment`)

};
