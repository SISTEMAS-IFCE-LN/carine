import {defineConfig} from '@playwright/test'

const FAKE_AUTH_URL = 'http://127.0.0.1:5173'
const ANONYMOUS_URL = 'http://127.0.0.1:5174'

// Dois servidores Vite: o principal injeta VITE_FAKE_AUTH para os fluxos
// autenticados (header/navegação); o segundo sobe sem fake auth para o smoke
// da tela de login (PublicOnly redirecionaria usuário autenticado para /).
export default defineConfig({
    testDir: './e2e',
    use: {
        baseURL: FAKE_AUTH_URL,
        trace: 'on-first-retry',
    },
    webServer: [
        {
            command: 'npm run dev -- --host 127.0.0.1 --port 5173 --strictPort',
            url: FAKE_AUTH_URL,
            reuseExistingServer: !process.env.CI,
            env: {
                ...(process.env as Record<string, string>),
                VITE_FAKE_AUTH: 'true',
            },
        },
        {
            command: 'npm run dev -- --host 127.0.0.1 --port 5174 --strictPort',
            url: ANONYMOUS_URL,
            reuseExistingServer: !process.env.CI,
            env: {
                ...(process.env as Record<string, string>),
                VITE_FAKE_AUTH: 'false',
            },
        },
    ],
    projects: [
        {name: 'desktop', use: {viewport: {width: 1280, height: 800}}},
        {name: 'mobile-se', use: {viewport: {width: 375, height: 667}}},
        {name: 'mobile-12', use: {viewport: {width: 390, height: 844}}},
        {name: 'ipad', use: {viewport: {width: 768, height: 1024}}},
    ],
})
