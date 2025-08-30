import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';
import dts from 'unplugin-dts/vite';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import { resolve } from 'path';
import removeTestIdAttribute from 'rollup-plugin-jsx-remove-attributes';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    libInjectCss(),
    dts({
      tsconfigPath: './tsconfig.app.json',
      bundleTypes: true,
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/scrollable.tsx'),
      formats: ['es']
    },
    copyPublicDir: false,
    rollupOptions: {
      external: ['react', 'react/jsx-runtime'],
      plugins: [
        removeTestIdAttribute({
          attributes: ['data-testid'],
          environments: ['production'],
        }),
      ],
    }
  }
})
