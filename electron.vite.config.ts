import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        plugins: [
          {
            name: 'copy-migrations',
            async writeBundle() {
              const fs = await import('fs/promises')
              const path = await import('path')
              const src = path.resolve(__dirname, 'src/main/database/migrations')
              const dest = path.resolve(__dirname, 'out/main/database/migrations')
              
              const copyDir = async (src, dest) => {
                await fs.mkdir(dest, { recursive: true })
                const entries = await fs.readdir(src, { withFileTypes: true })
                for (const entry of entries) {
                  const srcPath = path.join(src, entry.name)
                  const destPath = path.join(dest, entry.name)
                  if (entry.isDirectory()) {
                    await copyDir(srcPath, destPath)
                  } else {
                    await fs.copyFile(srcPath, destPath)
                  }
                }
              }
              
              try {
                await copyDir(src, dest)
                console.log('Migrations copied to out/main/database/migrations')
              } catch (err) {
                console.error('Failed to copy migrations:', err)
              }
            }
          }
        ]
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer')
      }
    },
    plugins: [react()]
  }
})
