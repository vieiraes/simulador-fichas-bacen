import AxeBuilder from '@axe-core/playwright';
import { test, expect } from './fixtures';

test.describe('qualidade da página', () => {
  test('sem violações de acessibilidade (WCAG 2.2 AA), antes e depois de usar', async ({ sim, page }) => {
    await sim.open();
    await page.clock.resume(); // o axe usa temporizadores internos; com o relógio congelado ele não termina
    const scan = () => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect((await scan()).violations).toEqual([]);
    await sim.consultNotFound(6);
    expect((await scan()).violations).toEqual([]);
  });

  test('não rola na horizontal (inclusive no celular)', async ({ sim, page }) => {
    await sim.open();
    await sim.consultNotFound(3);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('a tabela da regra mostra os mesmos números que o simulador aplica', async ({ sim, page }) => {
    await sim.open();
    const row = (name: string) => page.getByRole('row', { name: new RegExp(name) });
    await expect(row('chave encontrada')).toContainText('−1');
    await expect(row('chave inexistente')).toContainText('−20');
    await expect(row('chave inexistente')).toContainText('−3');
    await expect(row('Pix enviado')).toContainText('+2');
  });
});
