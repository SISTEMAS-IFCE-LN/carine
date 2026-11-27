import {test, expect} from '@playwright/test'

// Roda no servidor sem VITE_FAKE_AUTH (ver playwright.config.ts): o PublicOnly
// redirecionaria um usuário autenticado para a home, escondendo a tela.
test.use({baseURL: 'http://127.0.0.1:5174'})

test('login mostra botão Google', async ({page}) => {
    // Sem backend no smoke: respostas de auth determinísticas → estado anônimo.
    // Regex restrita: `**/auth/**` também casaria com `/src/components/auth/*`.
    await page.route(/\/auth\/(csrf-token|refresh)$/, (route) =>
        route.fulfill({status: 401, json: {}}),
    )

    await page.goto('/login')

    await expect(page.getByRole('button', {name: /entrar com google/i})).toBeVisible()
})
