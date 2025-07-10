import { PlaywrightTestConfig } from '@playwright/test'
const config: PlaywrightTestConfig = {
  use: { baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    timeout: 120 * 1000,
  },
}
export default config
