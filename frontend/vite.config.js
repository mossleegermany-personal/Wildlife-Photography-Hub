import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    // Enable fast refresh for better development experience
    fastRefresh: true,
    // Include .jsx files in fast refresh
    include: "**/*.{jsx,tsx}",
  })],
  server: {
    port: 3000,
    host: true, // Allow access from network
    open: true, // Automatically open browser
    hmr: {
      overlay: true, // Show errors as overlay
      port: 3001 // Use different port for HMR
    },
    watch: {
      // Watch for changes in these files
      usePolling: true,
      interval: 100
    }
  },
  build: {
    // Enable source maps for better debugging
    sourcemap: true,
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
