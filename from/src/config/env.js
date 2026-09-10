// src/config/env.js
export const env = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1',
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
}