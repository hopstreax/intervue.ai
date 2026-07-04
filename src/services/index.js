// services/index.js
// API service layer — connects frontend to the Express + MongoDB backend.

const API_BASE = 'http://localhost:5000/api';

/**
 * Helper: get the stored JWT token.
 */
const getToken = () => localStorage.getItem('intervue_token');

/**
 * Helper: make an authenticated JSON request.
 * Includes a timeout mechanism using AbortController.
 */
const apiFetch = async (url, options = {}, timeoutMs = 15000) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  console.log(`[Frontend] \u2192 Sending request to ${url}...`);

  try {
    const res = await fetch(`${API_BASE}${url}`, { 
      ...options, 
      headers, 
      signal: controller.signal 
    });
    
    clearTimeout(id);
    const data = await res.json();

    if (!res.ok) {
      console.error(`[Frontend] \u2716 Error from ${url}:`, data.message);
      throw new Error(data.message || 'Something went wrong');
    }
    
    console.log(`[Frontend] \u2714 Received response from ${url}:`, data);
    return data;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      console.error(`[Frontend] \u23F1 Request to ${url} timed out after ${timeoutMs}ms`);
      throw new Error('Connection timed out. The server took too long to respond.');
    }
    console.error(`[Frontend] \u2716 Network error on ${url}:`, error.message);
    throw error;
  }
};

// ── Auth Service ─────────────────────────────────────────────
export const authService = {
  /**
   * POST /api/auth/signup
   * Sends FormData (supports resume file upload).
   * Returns { success, data, token, resume }
   */
  signup: async ({ name, email, password, resumeFile }) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    if (resumeFile) {
      formData.append('resume', resumeFile);
    }

    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Do NOT set Content-Type — browser sets it with boundary for FormData
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Signup failed');

    // Persist token
    if (data.token) {
      localStorage.setItem('intervue_token', data.token);
      localStorage.setItem('intervue_user', JSON.stringify(data.data));
    }
    return data;
  },

  /**
   * POST /api/auth/login
   * Returns { success, data: { _id, name, email, role }, token }
   */
  login: async ({ email, password }) => {
    const result = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result.token) {
      localStorage.setItem('intervue_token', result.token);
      localStorage.setItem('intervue_user', JSON.stringify(result.data));
    }
    return result;
  },

  /**
   * Clear stored credentials on logout.
   */
  logout: () => {
    localStorage.removeItem('intervue_token');
    localStorage.removeItem('intervue_user');
  },

  /**
   * Check if user is currently authenticated.
   */
  isAuthenticated: () => !!getToken(),

  /**
   * Get the stored user object.
   */
  getUser: () => {
    const user = localStorage.getItem('intervue_user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Save OAuth credentials.
   */
  oauthLogin: (token, user) => {
    localStorage.setItem('intervue_token', token);
    localStorage.setItem('intervue_user', JSON.stringify(user));
  },
};

// ── Resume Upload Service ────────────────────────────────────
export const analyzeResume = async (file) => {
  const token = getToken();
  const formData = new FormData();
  formData.append('resume', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data;
};

// ── Interview Service ────────────────────────────────────────
export const interviewService = {
  /**
   * POST /api/interviews/start
   * Start a new chat interview session. (10s timeout injected)
   */
  start: async () => {
    return apiFetch('/interviews/start', {
      method: 'POST',
    }, 10000); // 10 second timeout
  },

  /**
   * POST /api/interviews/chat
   * Chat with Llama-3 AI.
   */
  chat: async ({ interviewId, message }) => {
    return apiFetch('/interviews/chat', {
      method: 'POST',
      body: JSON.stringify({ interviewId, message }),
    });
  },

  /**
   * GET /api/interviews
   * Fetch all interviews for the logged-in user.
   */
  getInterviews: async () => {
    return apiFetch('/interviews');
  },
};

// ── Analytics Service ────────────────────────────────────────
export const analyticsService = {
  /**
   * GET /api/analytics
   * Fetch user's performance analytics.
   */
  getAnalytics: async () => {
    return apiFetch('/analytics');
  },
};
