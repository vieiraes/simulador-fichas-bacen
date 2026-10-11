import { test } from './fixtures';

// Gera a imagem do README (só quando SCREENSHOT=1).
test('imagem do README', async ({ sim, page }, info) => {
  test.skip(!process.env.SCREENSHOT || info.project.name !== 'desktop-chromium');
  await page.setViewportSize({ width: 1280, height: 900 });
  await sim.open();
  await sim.scenario({ user: 'maria', keyType: 'CPF', category: 'H' });
  await sim.consultNotFound(4);
  await sim.consultFound();
  await sim.pay();
  await sim.consultNotFound(2);
  await page.waitForTimeout(600); // fim da animação das barras
  await page.screenshot({ path: 'docs/img/simulador.png', fullPage: false });
});
