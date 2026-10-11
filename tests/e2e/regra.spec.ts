import { test, expect } from './fixtures';

test.describe('regra de contagem do DICT', () => {
  test.beforeEach(async ({ sim }) => {
    await sim.open();
  });

  test('consulta com chave encontrada (200) tira 1 do usuário e 1 do participante', async ({ sim }) => {
    await sim.scenario({ user: 'maria', keyType: 'CPF', category: 'F' });
    await sim.consultFound();
    await expect(sim.lastStatus()).toHaveText('200');
    await expect(sim.tokens('user-v2')).toHaveText('99');
    await expect(sim.tokens('participant')).toHaveText('499');
    await expect(sim.tokens('user-v1')).toHaveText('100'); // EMAIL/PHONE não é afetado
  });

  test('consulta com chave inexistente (404) tira 20 do usuário e 3 do participante', async ({ sim }) => {
    await sim.scenario({ user: 'maria', keyType: 'EMAIL' });
    await sim.consultNotFound();
    await expect(sim.lastStatus()).toHaveText('404');
    await expect(sim.tokens('user-v1')).toHaveText('80');
    await expect(sim.tokens('participant')).toHaveText('497');
    await expect(sim.payBtn).toBeDisabled(); // 404 não gera endToEndId para pagar
  });

  test('Pix enviado devolve as fichas da consulta, uma única vez', async ({ sim }) => {
    await sim.scenario({ user: 'maria', keyType: 'EVP' });
    await sim.consultNotFound(); // 80
    await sim.consultFound(); // 79
    await sim.pay(); // +1 → 80
    await expect(sim.lastStatus()).toHaveText('PAGO');
    await expect(sim.tokens('user-v2')).toHaveText('80');
    await sim.pay();
    await expect(sim.lastStatus()).toHaveText('RECUSADO');
    await expect(sim.lastEntry()).toContainText('só vale uma vez');
    await expect(sim.tokens('user-v2')).toHaveText('80');
  });

  test('pessoa jurídica: balde de 1.000 e devolução de 2 fichas por Pix', async ({ sim }) => {
    await sim.scenario({ user: 'padaria', keyType: 'CNPJ', category: 'A' });
    await expect(sim.tokens('user-v2')).toHaveText('1.000');
    await sim.consultNotFound(); // 980
    await sim.consultFound(); // 979
    await sim.pay(); // 981
    await expect(sim.tokens('user-v2')).toHaveText('981');
  });
});

test.describe('proteção contra varredura (anti-scan)', () => {
  test('PF aguenta 5 consultas inexistentes; a 6ª recebe 429 e não cobra nada', async ({ sim }) => {
    await sim.open();
    await sim.scenario({ user: 'maria', keyType: 'PHONE', category: 'A' });
    await sim.consultNotFound(5);
    await expect(sim.tokens('user-v1')).toHaveText('0');
    const participantBefore = await sim.tokenCount('participant');
    await sim.consultNotFound();
    await expect(sim.lastStatus()).toHaveText('429');
    await expect(sim.lastEntry()).toContainText('ENTRIES_READ_USER_ANTISCAN');
    await expect(sim.lastEntry()).toContainText('Nada foi cobrado');
    expect(await sim.tokenCount('participant')).toBe(participantBefore);
    expect(await sim.statuses()).toEqual(['429', '404', '404', '404', '404', '404']);
  });

  test('o participante também bloqueia: categoria H (50 fichas) com uma PJ fazendo varredura', async ({ sim }) => {
    await sim.open();
    await sim.scenario({ user: 'padaria', keyType: 'EVP', category: 'H' });
    await sim.consultNotFound(17); // 17 × 3 = 51 > 50: a 17ª zera o balde
    await expect(sim.tokens('participant')).toHaveText('0');
    await sim.consultNotFound();
    await expect(sim.lastStatus()).toHaveText('429');
    await expect(sim.lastEntry()).toContainText('ENTRIES_READ_PARTICIPANT_ANTISCAN');
  });
});
