// Environment configuration for API endpoints
const config = {
  development: {
    API_BASE_URL: 'http://localhost:3001',
    SOCKET_URL: 'http://localhost:3001'
  },
  production: {
    // Temporarily disabled for frontend-only deployment
    // You'll need to deploy your backend to Azure and update these URLs
    API_BASE_URL: null, // Will cause API calls to be skipped
    SOCKET_URL: null    // Will cause socket connections to be skipped
  }
}

const env = import.meta.env.MODE || 'development'
export default config[env]