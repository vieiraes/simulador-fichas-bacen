import { expect, type Locator, type Page } from '@playwright/test';

export type BucketId = 'user-v1' | 'user-v2' | 'participant';

/** Page Object do simulador: os testes falam a língua do negócio, não de seletores. */
export class SimulatorPage {
  readonly consultFoundBtn: Locator;
  readonly consultNotFoundBtn: Locator;
  readonly payBtn: Locator;
  readonly resetBtn: Locator;
  readonly log: Locator;

  constructor(readonly page: Page) {
    this.consultFoundBtn = page.getByTestId('consult-found');
    this.consultNotFoundBtn = page.getByTestId('consult-not-found');
    this.payBtn = page.getByTestId('pay');
    this.resetBtn = page.getByTestId('reset');
    this.log = page.getByTestId('log');
  }

  async open() {
    await this.page.goto('/');
    await expect(this.page.getByRole('heading', { level: 1 })).toHaveText('Simulador de Fichas do DICT');
  }

  async scenario(opts: { user?: 'maria' | 'padaria'; keyType?: string; category?: string; speed?: number }) {
    if (opts.user) await this.page.getByTestId('user').selectOption(opts.user);
    if (opts.keyType) await this.page.getByTestId('key-type').selectOption(opts.keyType);
    if (opts.category) await this.page.getByTestId('category').selectOption(opts.category);
    if (opts.speed) await this.page.getByTestId('speed').selectOption(String(opts.speed));
  }

  async consultFound(times = 1) { for (let i = 0; i < times; i++) await this.consultFoundBtn.click(); }
  async consultNotFound(times = 1) { for (let i = 0; i < times; i++) await this.consultNotFoundBtn.click(); }
  async pay() { await this.payBtn.click(); }

  tokens(bucket: BucketId) { return this.page.getByTestId(`tokens-${bucket}`); }
  async tokenCount(bucket: BucketId) { return Number((await this.tokens(bucket).innerText()).replace(/\./g, '')); }

  /** Status da resposta mais recente (o histórico é do mais novo para o mais antigo). */
  lastStatus() { return this.log.getByTestId('status').first(); }
  lastEntry() { return this.log.locator('li').first(); }
  statuses() { return this.log.getByTestId('status').allInnerTexts(); }
}
