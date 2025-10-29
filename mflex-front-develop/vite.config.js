import { fileURLToPath, URL } from 'node:url';
import autoprefixer from 'autoprefixer';
// import Components from 'unplugin-vue-components/vite';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// import path from 'path';
// import glob from 'glob';

export default defineConfig({
  // build: {
  //   // outDir: '../testing/dist',
  // },
  base: './',
  //build 시에 모든 console.log를 제거
  esbuild: {
    drop: ['console', 'debugger'],
  },
  server: {
    port: '8888',
    overlay: false,
  },
  // mode: 'development',
  plugins: [
    vue(),
    // Components({
    //   dirs: ['src/components/app'],
    //   dts: true,
    // }),
  ],
  css: {
    devSourcemap: true,
    postcss: {
      plugins: [autoprefixer],
    },
  },
  build: {
    chunkSizeWarningLimit: 1600,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id
              .toString()
              .split('node_modules/')[1]
              .split('/')[0]
              .toString();
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
  define: {
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true',
  },
});
