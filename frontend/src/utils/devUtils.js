// Development utilities for Wildlife Photography App
// This file provides helpful debugging and HMR utilities

export const devUtils = {
  // Log component updates
  logUpdate: (componentName) => {
    if (import.meta.env.DEV) {
      console.log(`🔄 ${componentName} component updated at ${new Date().toLocaleTimeString()}`)
    }
  },

  // Log style updates
  logStyleUpdate: (fileName) => {
    if (import.meta.env.DEV) {
      console.log(`🎨 ${fileName} styles updated at ${new Date().toLocaleTimeString()}`)
    }
  },

  // Show update notification
  showUpdateNotification: (message) => {
    if (import.meta.env.DEV) {
      // Create temporary notification
      const notification = document.createElement('div')
      notification.innerHTML = `
        <div style="
          position: fixed;
          top: 60px;
          right: 10px;
          background: rgba(59, 130, 246, 0.95);
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          z-index: 10000;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          animation: slideIn 0.3s ease-out;
          max-width: 300px;
        ">
          🔄 ${message}
        </div>
        <style>
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        </style>
      `
      document.body.appendChild(notification)

      // Remove after 3 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.style.animation = 'slideOut 0.3s ease-in'
          setTimeout(() => {
            document.body.removeChild(notification)
          }, 300)
        }
      }, 3000)
    }
  },

  // Check if in development mode
  isDev: () => import.meta.env.DEV,

  // Get environment info
  getEnvInfo: () => ({
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD,
    baseUrl: import.meta.env.BASE_URL,
    hmr: !!import.meta.hot
  }),

  // Log app startup
  logStartup: () => {
    if (import.meta.env.DEV) {
      console.group('🌿 Wildlife Photography App - Development Info')
      console.log('Mode:', import.meta.env.MODE)
      console.log('HMR Enabled:', !!import.meta.hot)
      console.log('Base URL:', import.meta.env.BASE_URL)
      console.log('Build Time:', new Date().toLocaleString())
      console.groupEnd()
    }
  }
}

// Auto-setup HMR logging if available
if (import.meta.hot) {
  devUtils.logStartup()
  
  // Global HMR accept for this utils file
  import.meta.hot.accept(() => {
    devUtils.logUpdate('DevUtils')
  })
}

export default devUtils
