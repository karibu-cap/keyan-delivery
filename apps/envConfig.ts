import pkg from '@next/env'
const { loadEnvConfig } = pkg

const projectDir = process.cwd()
const { combinedEnv } = loadEnvConfig(projectDir)

// Export loaded env vars (with fallback to process.env for runtime overrides)
export const env = {
  DATABASE_URL: process.env.DATABASE_URL || combinedEnv.DATABASE_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || combinedEnv.NEXT_PUBLIC_APP_URL,
}

// Log to verify env loading
if (!env.DATABASE_URL) {
  console.error('env DATABASE_URL or OPTIMIZE_API_KEY is not defined in environment')
}