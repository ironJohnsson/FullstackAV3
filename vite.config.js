import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor_react: ['react', 'react-dom'],
          vendor_charts: ['recharts'],
          vendor_maps: ['leaflet', 'react-leaflet'],
          vendor_supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
});
