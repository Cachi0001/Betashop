// Centralized API base configuration for frontend
// Source of truth for building API URLs across the app

export const getApiBase = () => {
  const base = import.meta.env.VITE_API_BASE_URL?.trim();
  // Ensure no trailing slash to avoid double slashes when composing URLs
  const normalized = (base && base.replace(/\/$/, '')) || 'http://localhost:3000/api';
  return normalized;
};

export const API_BASE = getApiBase();

// Helper to compose URLs safely (avoids duplicate slashes)
export const apiUrl = (path = '') => {
  if (!path) return API_BASE;
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
};
