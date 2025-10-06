import { CONFIG } from 'src/config-global';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('accessToken');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login response
   */
  async login(email, password) {
    try {
      const response = await fetch(`${CONFIG.site.serverUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        this.token = data.data.token;
        this.user = data.data.user;
        
        // Store in localStorage
        localStorage.setItem('accessToken', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        return data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register new user
   * @param {string} email - User email
   * @param {string} name - User name
   * @param {string} password - User password
   * @returns {Promise<Object>} Registration response
   */
  async register(email, name, password) {
    try {
      const response = await fetch(`${CONFIG.site.serverUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, password }),
      });

      const data = await response.json();

      if (data.success) {
        this.token = data.data.token;
        this.user = data.data.user;
        
        // Store in localStorage
        localStorage.setItem('accessToken', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        return data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  /**
   * Get current user
   * @returns {Object|null} Current user
   */
  getCurrentUser() {
    return this.user;
  }

  /**
   * Get auth token
   * @returns {string|null} Auth token
   */
  getToken() {
    return this.token;
  }

  /**
   * Make authenticated API request
   * @param {string} url - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async authenticatedRequest(url, options = {}) {
    if (!this.token) {
      throw new Error('No authentication token available');
    }

    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    return fetch(url, { ...options, ...defaultOptions });
  }
}

// Create and export a singleton instance
export const authService = new AuthService();
export default authService;
