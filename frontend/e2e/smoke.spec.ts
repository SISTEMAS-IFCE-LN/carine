import {test, expect, type Page} from '@playwright/test'

const CAMPUS = [{id: 1, nome: 'LIMOEIRO DO NORTE'}]

async function mockCampus(page: Page) {
    await page.route('**/api/ambientes/publicados/campus', (route) =>
        route.fulfill({json: CAMPUS}),
    )
}

test('home exibe campi (não redireciona para publicados)', async ({page}) => {
    await mockCampus(page)
    await page.goto('/')

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', {name: 'Campus'})).toBeVisible()
    await expect(
        page.getByRole('link', {name: /abrir campus limoeiro do norte/i}),
    ).toBeVisible()
})

test('hamburger abre dropdown com o item Listar', async ({page}) => {
    await mockCampus(page)
    await page.setViewportSize({width: 375, height: 667})
    await page.goto('/')

    await page.getByRole('button', {name: 'Abrir menu de navegação'}).click()

    await expect(page.getByRole('link', {name: /^listar$/i})).toBeVisible()
})

test('avatar abre UserMenu (Sheet) no mobile', async ({page}) => {
    await mockCampus(page)
    await page.setViewportSize({width: 375, height: 667})
    await page.goto('/')

    await page.getByRole('button', {name: 'Abrir perfil'}).filter({visible: true}).click()

    await expect(page.getByText('Dev FakeAuth')).toBeVisible()
    await expect(page.getByText('dev@ifce.edu.br')).toBeVisible()
    await expect(page.getByRole('button', {name: 'Sair'})).toBeVisible()
})

test('fluxo up-down: home → campus → unidade → bloco → listagem', async ({page}) => {
    await page.route('**/api/ambientes/publicados/campus', (route) =>
        route.fulfill({json: CAMPUS}),
    )
    await page.route(/\/api\/ambientes\/publicados\/unidades\?campusId=1$/, (route) =>
        route.fulfill({json: [{id: 1, nome: 'SEDE'}]}),
    )
    await page.route(/\/api\/ambientes\/publicados\/blocos\?unidadeId=1$/, (route) =>
        route.fulfill({json: [{id: 1, nome: 'BLOCO A'}]}),
    )
    await page.route(/\/api\/ambientes\/publicados\/blocos\/1\/resumo$/, (route) =>
        route.fulfill({
            json: {
                id: 1,
                nome: 'BLOCO A',
                areaTotal: 100,
                pavimentos: 2,
                capacidadeTotal: 50,
                tipos: [{tipo: 'Sala de Aula', total: 1}],
                andares: [{andar: 1, total: 1}],
            },
        }),
    )
    await page.route(/\/api\/ambientes\/publicados\/localizacao\?.*blocoId=1/, (route) =>
        route.fulfill({
            json: {
                ambientes: [
                    {
                        id: 1,
                        nome: 'Sala 101',
                        tipo: 'Sala de Aula',
                        localizacao: {
                            id: 1,
                            campus: {id: 1, nome: 'LIMOEIRO DO NORTE'},
                            unidade: {id: 1, nome: 'SEDE'},
                            bloco: {id: 1, nome: 'BLOCO A'},
                            andar: 1,
                        },
                        capacidade: 30,
                        area: 50,
                    },
                ],
                areaTotal: 50,
                dadosPaginacao: {
                    totalElements: 1,
                    totalPages: 1,
                    currentPage: 0,
                    pageSize: 20,
                    hasNext: false,
                    hasPrevious: false,
                },
            },
        }),
    )

    await page.goto('/')
    await page.getByRole('link', {name: /abrir campus limoeiro do norte/i}).click()
    await page.getByRole('link', {name: /abrir unidade sede/i}).click()
    await page.getByRole('link', {name: /abrir bloco bloco a/i}).click()
    await page.getByRole('link', {name: /ver todos os ambientes do bloco/i}).click()

    await expect(page).toHaveURL(/\/ambientes\/publicados\?.*blocoId=1/)
    await expect(page.getByRole('link', {name: 'Sala 101'})).toBeVisible()
})
