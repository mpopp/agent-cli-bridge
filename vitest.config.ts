import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          setupFiles: ['./tests/setup.ts'],
          include: ['tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}']
        }
      },
      {
        test: {
          name: 'integration',
          environment: 'node',
          setupFiles: ['./tests/integration/setup.ts'],
          include: ['tests/integration/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}']
        }
      }
    ]
  }
})
