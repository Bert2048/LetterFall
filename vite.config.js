import { defineConfig } from 'vite'

export default defineConfig({
    base: './',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        rollupOptions: {
            output: {
                // Keep phaser in its own chunk so browser can cache it separately
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        }
    }
})
