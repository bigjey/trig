import { defineConfig } from 'vite'
import path from 'node:path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                index: path.resolve(__dirname, 'index.html'),
                ray_circle_intersection: path.resolve(__dirname, 'ray-circle-intersection.html'),
            },
        },
    },
})