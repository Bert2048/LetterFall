import { defineConfig } from 'vite'

export default defineConfig({
    base: './',
    build: {
        outDir: 'dist',
        assetsDir: 'js',
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
