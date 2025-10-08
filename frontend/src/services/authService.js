import { CONFIG } from 'src/config-global';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('accessToken');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
    
    // Validate token on initialization
    this.validateStoredToken();
  }

  /**
   * Validate stored token and clear if invalid
   */
  validateStoredToken() {
    if (this.token && this.user) {
      // Check if token is expired (basic check)
      try {
        const tokenParts = this.token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          
          if (payload.exp && payload.exp < currentTime) {
            console.warn('Stored token is expired, clearing session');
            this.logout();
          }
        }
      } catch (error) {
        console.warn('Invalid token format, clearing session');
        this.logout();
      }
    }
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
    // Refresh token from localStorage in case it was updated elsewhere
    this.token = localStorage.getItem('accessToken');
    
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

    const response = await fetch(url, { ...options, ...defaultOptions });
    
    // If we get a 401/403, the token might be invalid
    if (response.status === 401 || response.status === 403) {
      console.warn('Authentication failed, clearing session');
      this.logout();
      throw new Error('Authentication failed. Please log in again.');
    }

    return response;
  }
}

// Create and export a singleton instance
export const authService = new AuthService();
export default authService;
