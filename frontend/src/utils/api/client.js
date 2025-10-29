import axios from 'axios';

// Determine baseURL safely for both browser and SSR.
// - In the browser, we prefer relative '/api' so Next.js rewrites proxy to backend (avoids CORS).
// - In SSR, use INTERNAL_API_URL or NEXT_PUBLIC_API_URL to call backend directly.
const isBrowser = typeof window !== 'undefined';
const internalApiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;

const baseURL = isBrowser ? '/api' : (internalApiUrl ? `${internalApiUrl}/api` : '/api');

const client = axios.create({
  baseURL,
  timeout: 10000,
  // Do not set cache-related headers here; browsers can manage caching.
});

// Simple retry for idempotent GETs
async function retryOnce(error) {
  const config = error.config;
  if (!config || config.__retry) return Promise.reject(error);
  if ((config.method || 'get').toLowerCase() !== 'get') return Promise.reject(error);
  config.__retry = true;
  await new Promise(r => setTimeout(r, 250));
  return client.request(config);
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const kind = (() => {
      if (error.response) return `http_${error.response.status}`;
      if (error.code === 'ECONNABORTED') return 'timeout';
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('network') || msg.includes('cors')) return 'network_or_cors';
      return 'unknown';
    })();

    // Log concise diagnostic once per error
    if (typeof console !== 'undefined' && console.error) {
      console.error('API error:', {
        kind,
        message: error.message,
        code: error.code,
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
      });
    }

    // Retry once for transient failures on GET
    if (kind === 'network_or_cors' || kind === 'timeout') {
      try {
        return await retryOnce(error);
      } catch (e) {
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export default client;


