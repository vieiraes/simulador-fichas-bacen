import { test as base, expect } from '@playwright/test';
import { SimulatorPage } from './pages/SimulatorPage';

export const T0 = new Date('2026-10-11T12:00:00-03:00');

/**
 * Fixture: relógio da página congelado em T0 (a reposição só anda quando o teste manda, com page.clock.runFor),
 * Page Object pronto e falha automática se aparecer erro no console da página.
 */
export const test = base.extend<{ sim: SimulatorPage }>({
  sim: async ({ page }, use) => {
    await page.clock.install({ time: T0 });
    await page.clock.pauseAt(new Date(T0.getTime() + 1_000));
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    const sim = new SimulatorPage(page);
    await use(sim);
    expect(errors, 'erros no console da página').toEqual([]);
  },
});
export { expect };
