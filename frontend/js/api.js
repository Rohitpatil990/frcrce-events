/**
 * API Utility Functions
 * Event Management System
 */

const API_BASE_URL = '/api';

// Utility function to make API calls
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Auth API
const authAPI = {
  login: (credentials) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  register: (userData) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  logout: () => apiCall('/auth/logout', {
    method: 'POST',
  }),

  getMe: () => apiCall('/auth/me'),

  updateProfile: (data) => apiCall('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  changePassword: (data) => apiCall('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Event API
const eventAPI = {
  getAllEvents: (params = '') => apiCall(`/events?${params}`),
  
  getEvent: (id) => apiCall(`/events/${id}`),
  
  createEvent: (eventData) => apiCall('/events', {
    method: 'POST',
    body: JSON.stringify(eventData),
  }),
  
  updateEvent: (id, eventData) => apiCall(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(eventData),
  }),
  
  deleteEvent: (id) => apiCall(`/events/${id}`, {
    method: 'DELETE',
  }),
  
  approveEvent: (id, data) => apiCall(`/events/${id}/approve`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  getPendingEvents: () => apiCall('/events/pending/list'),
  
  getEventStats: () => apiCall('/events/stats'),
};

// Registration API
const registrationAPI = {
  registerForEvent: (eventId) => apiCall(`/registrations/${eventId}`, {
    method: 'POST',
  }),
  
  cancelRegistration: (id) => apiCall(`/registrations/${id}`, {
    method: 'DELETE',
  }),
  
  getMyRegistrations: () => apiCall('/registrations/my'),
  
  getEventRegistrations: (eventId) => apiCall(`/registrations/event/${eventId}`),
  
  submitFeedback: (id, data) => apiCall(`/registrations/${id}/feedback`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Attendance API
const attendanceAPI = {
  markAttendance: (eventId, data) => apiCall(`/attendance/event/${eventId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  getEventAttendance: (eventId) => apiCall(`/attendance/event/${eventId}`),
  
  getMyAttendance: () => apiCall('/attendance/my'),
  
  getAttendanceStats: (eventId) => apiCall(`/attendance/event/${eventId}/stats`),
};

// Certificate API
const certificateAPI = {
  generateCertificates: (eventId) => apiCall(`/certificates/event/${eventId}/generate`, {
    method: 'POST',
  }),
  
  getMyCertificates: () => apiCall('/certificates/my'),
  
  getCertificate: (id) => apiCall(`/certificates/${id}`),
  
  downloadCertificate: (id) => {
    window.location.href = `${API_BASE_URL}/certificates/${id}/download`;
  },
  
  verifyCertificate: (certNumber) => apiCall(`/certificates/verify/${encodeURIComponent(certNumber)}`),
  
  getEventCertificates: (eventId) => apiCall(`/certificates/event/${eventId}`),
};

// Admin API
const adminAPI = {
  getAllUsers: (params = '') => apiCall(`/admin/users?${params}`),
  
  getUser: (id) => apiCall(`/admin/users/${id}`),
  
  createUser: (userData) => apiCall('/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  updateUser: (id, userData) => apiCall(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  
  toggleUserStatus: (id) => apiCall(`/admin/users/${id}/toggle-status`, {
    method: 'PUT',
  }),
  
  resetUserPassword: (id, newPassword) => apiCall(`/admin/users/${id}/reset-password`, {
    method: 'PUT',
    body: JSON.stringify({ newPassword }),
  }),
  
  getDashboardStats: () => apiCall('/admin/dashboard-stats'),
  
  getAnalytics: (params = '') => apiCall(`/admin/analytics?${params}`),
};

// Utility Functions
const utils = {
  escapeHtml: (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]),

  formatDate: (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  formatDateTime: (date) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  formatTime: (time) => {
    return time;
  },

  showAlert: (message, type = 'success') => {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.main-content') || document.body;
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => {
      alertDiv.remove();
    }, 5000);
  },

  showLoading: () => {
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.id = 'loading-spinner';
    document.body.appendChild(spinner);
  },

  hideLoading: () => {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
      spinner.remove();
    }
  },

  confirmAction: (message) => {
    return confirm(message);
  },

  saveToLocalStorage: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },

  getFromLocalStorage: (key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },

  removeFromLocalStorage: (key) => {
    localStorage.removeItem(key);
  },

  getUserFromStorage: () => {
    return utils.getFromLocalStorage('user');
  },

  isLoggedIn: () => {
    return !!utils.getUserFromStorage();
  },

  checkAuth: () => {
    if (!utils.isLoggedIn()) {
      window.location.href = '/pages/login.html';
      return false;
    }
    return true;
  },

  logout: async () => {
    try {
      await authAPI.logout();
      utils.removeFromLocalStorage('user');
      window.location.href = '/pages/login.html';
    } catch (error) {
      console.error('Logout error:', error);
      utils.removeFromLocalStorage('user');
      window.location.href = '/pages/login.html';
    }
  },
};
