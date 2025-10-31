// // import { defineConfig } from 'vite'
// // import react from '@vitejs/plugin-react'

// // // https://vite.dev/config/
// // export default defineConfig({
// //   plugins: [react()],
// // })
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//     esbuild: {
//     jsx: 'automatic',
//   },
//   optimizeDeps: {
//     include: ['react', 'react-dom']
//   },
//   server: {
//     port: 3000,
//     host: true,
//     proxy: {
//       '/api': {
//         target: 'http://localhost:5000',
//         changeOrigin: true,
//         secure: false
//       }
//     }
//   },
//   build: {
//     outDir: 'dist',
//     sourcemap: true,
//     rollupOptions: {
//       output: {
//         manualChunks: {
//           vendor: ['react', 'react-dom'],
//           router: ['react-router-dom'],
//           crypto: ['crypto-js']
//         }
//       }
//     }
//   }
// })


// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 3000,
//     host: true,
//     proxy: {
//       '/api': {
//         target: 'http://localhost:5000',
//         changeOrigin: true,
//         secure: false
//       }
//     }
//   }
// })

// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 3000,
//     proxy: {
//       '/api': {
//         target: 'http://localhost:5000',
//         changeOrigin: true,
//         secure: false
//       }
//     }
//   }
// });

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})