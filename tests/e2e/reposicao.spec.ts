import { test, expect } from './fixtures';

// O relógio da página está congelado (fixture); aqui o teste avança minutos sem esperar de verdade.
test.describe('reposição de fichas ao longo do tempo', () => {
  test('PF vazio recupera 2 fichas por minuto e volta a consultar depois do 429', async ({ sim, page }) => {
    await sim.open();
    await sim.scenario({ user: 'maria', keyType: 'CPF', category: 'A' });
    await sim.consultNotFound(5);
    await sim.consultFound();
    await expect(sim.lastStatus()).toHaveText('429');

    await page.clock.runFor(29_000);
    await expect(sim.tokens('user-v2')).toHaveText('0');
    await page.clock.runFor(1_000); // 30 s = 1 ficha
    await expect(sim.tokens('user-v2')).toHaveText('1');
    await sim.consultFound();
    await expect(sim.lastStatus()).toHaveText('200');

    // saltos grandes: fastForward pula o tempo de uma vez (runFor executaria cada tique de 250 ms)
    await page.clock.fastForward(10 * 60_000);
    await expect(sim.tokens('user-v2')).toHaveText('20');
    await page.clock.fastForward(60 * 60_000);
    await expect(sim.tokens('user-v2')).toHaveText('100'); // nunca passa do teto
  });

  test('a velocidade do relógio acelera a reposição (60×: 1 s real = 1 min simulado)', async ({ sim, page }) => {
    await sim.open();
    await sim.scenario({ user: 'maria', keyType: 'EMAIL', speed: 60 });
    await sim.consultNotFound(5);
    await expect(sim.tokens('user-v1')).toHaveText('0');
    await page.clock.runFor(5_000); // 5 min simulados
    await expect(sim.tokens('user-v1')).toHaveText('10');
  });
});
