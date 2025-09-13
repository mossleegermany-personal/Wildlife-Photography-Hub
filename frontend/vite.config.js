import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: './', // Use relative paths for assets
  plugins: [react({
    // Enable fast refresh for better development experience
    fastRefresh: true,
    // Include .jsx files in fast refresh
    include: "**/*.{jsx,tsx}",
  })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@css': path.resolve(__dirname, './src/css')
    }
  },
  server: {
    port: 3000,
    host: true, // Allow access from network
    open: true, // Automatically open browser
    hmr: {
      overlay: true, // Show errors as overlay
      port: 3002 // Use different port for HMR (changed from 3001 to 3002)
    },
    watch: {
      // Watch for changes in these files
      usePolling: true,
      interval: 100
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    cssCodeSplit: false, // Bundle all CSS into one file
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        },
        // Ensure CSS files are properly named
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
