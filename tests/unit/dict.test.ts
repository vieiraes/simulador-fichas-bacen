import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  COUNTING, PARTICIPANT_BUCKETS, USER_BUCKETS, available, consultKey, createState, policyForKey, refill, refillAll,
  scansUntilBlocked, sendPayment, setCategory, type Bucket, type DictState, type KeyType, type ParticipantCategory,
} from '../../src/domain/dict';

const T0 = 1_700_000_000_000;
const MIN = 60_000;
const users = [
  { id: 'pf', name: 'Maria (PF)', personType: 'PF' as const },
  { id: 'pj', name: 'Padaria (PJ)', personType: 'PJ' as const },
];
const fresh = (category: ParticipantCategory = 'F') => createState({ now: T0, category, users });
const userTokens = (s: DictState, id: string, key: KeyType) => available(s.users[id].buckets[policyForKey(key)]);
/** Põe um balde num valor exato, para testar valores-limite. */
function withTokens(s: DictState, who: 'participant' | { id: string; key: KeyType }, tokens: number): DictState {
  if (who === 'participant') return { ...s, participant: { ...s.participant, tokens } };
  const u = s.users[who.id];
  const p = policyForKey(who.key);
  return { ...s, users: { ...s.users, [who.id]: { ...u, buckets: { ...u.buckets, [p]: { ...u.buckets[p], tokens } } } } };
}

describe('parâmetros oficiais (tabela da especificação do DICT)', () => {
  it('balde do usuário: PF 100 fichas e 2/min; PJ 1.000 e 20/min', () => {
    expect(USER_BUCKETS).toEqual({ PF: { capacity: 100, refillPerMinute: 2 }, PJ: { capacity: 1000, refillPerMinute: 20 } });
  });
  it.each([
    ['A', 50_000, 25_000], ['B', 40_000, 20_000], ['C', 30_000, 15_000], ['D', 16_000, 8_000],
    ['E', 5_000, 2_500], ['F', 500, 250], ['G', 250, 25], ['H', 50, 2],
  ] as const)('participante categoria %s: %i fichas, %i/min', (cat, capacity, refillPerMinute) => {
    expect(PARTICIPANT_BUCKETS[cat]).toEqual({ capacity, refillPerMinute });
  });
  it('contagem: 200 tira 1/1, 404 tira 20/3, pagamento devolve PF +1, PJ +2 e participante +1', () => {
    expect(COUNTING).toEqual({ user: { found: 1, notFound: 20, paymentRefund: { PF: 1, PJ: 2 } }, participant: { found: 1, notFound: 3, paymentRefund: 1 } });
  });
});

describe('política por tipo de chave', () => {
  it.each([
    ['EMAIL', 'ENTRIES_READ_USER_ANTISCAN'], ['PHONE', 'ENTRIES_READ_USER_ANTISCAN'],
    ['CPF', 'ENTRIES_READ_USER_ANTISCAN_V2'], ['CNPJ', 'ENTRIES_READ_USER_ANTISCAN_V2'], ['EVP', 'ENTRIES_READ_USER_ANTISCAN_V2'],
  ] as const)('%s → %s', (key, policy) => expect(policyForKey(key)).toBe(policy));

  it('os dois baldes do usuário são independentes', () => {
    const r = consultKey(fresh(), { userId: 'pf', keyType: 'EMAIL', keyExists: false, now: T0 });
    expect(userTokens(r.state, 'pf', 'EMAIL')).toBe(80);
    expect(userTokens(r.state, 'pf', 'CPF')).toBe(100);
  });
});

describe('consulta de chave: tabela de decisão', () => {
  // [descrição, balde do usuário, balde do participante, chave existe, status, usuário depois, participante depois]
  it.each([
    ['chave existe', 100, 500, true, 200, 99, 499],
    ['chave não existe', 100, 500, false, 404, 80, 497],
    ['usuário com 1 ficha, chave existe', 1, 500, true, 200, 0, 499],
    ['usuário com 1 ficha, 404 zera sem ficar negativo', 1, 500, false, 404, 0, 497],
    ['usuário com 0 ficha → 429 sem cobrar', 0, 500, true, 429, 0, 500],
    ['usuário com 0,99 ficha → 429 (fichas inteiras)', 0.99, 500, true, 429, 0, 500],
    ['participante com 0 → 429 sem cobrar', 100, 0, true, 429, 100, 0],
    ['participante com 2, 404 zera sem negativo', 100, 2, false, 404, 80, 0],
    ['participante com 1 ficha, chave existe', 100, 1, true, 200, 99, 0],
  ] as const)('%s', (_desc, userT, partT, exists, status, userAfter, partAfter) => {
    let s = withTokens(fresh(), { id: 'pf', key: 'CPF' }, userT);
    s = withTokens(s, 'participant', partT);
    const r = consultKey(s, { userId: 'pf', keyType: 'CPF', keyExists: exists, now: T0 });
    expect(r.status).toBe(status);
    expect(userTokens(r.state, 'pf', 'CPF')).toBe(userAfter);
    expect(available(r.state.participant)).toBe(partAfter);
  });

  it('429 diz qual política bloqueou', () => {
    const u = consultKey(withTokens(fresh(), { id: 'pf', key: 'EMAIL' }, 0), { userId: 'pf', keyType: 'EMAIL', keyExists: true, now: T0 });
    expect(u.limitedBy).toBe('ENTRIES_READ_USER_ANTISCAN');
    const p = consultKey(withTokens(fresh(), 'participant', 0), { userId: 'pf', keyType: 'EMAIL', keyExists: true, now: T0 });
    expect(p.limitedBy).toBe('ENTRIES_READ_PARTICIPANT_ANTISCAN');
  });

  it('varredura (scan): PF aguenta 5 consultas 404 seguidas; a 6ª recebe 429', () => {
    let s = fresh('A');
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const r = consultKey(s, { userId: 'pf', keyType: 'EVP', keyExists: false, now: T0 });
      statuses.push(r.status);
      s = r.state;
    }
    expect(statuses).toEqual([404, 404, 404, 404, 404, 429]);
    expect(scansUntilBlocked(100)).toBe(5);
    expect(scansUntilBlocked(1000)).toBe(50);
  });

  it('usuário desconhecido é erro de programação, não 4xx', () => {
    expect(() => consultKey(fresh(), { userId: 'x', keyType: 'CPF', keyExists: true, now: T0 })).toThrow(/desconhecido/);
  });
});

describe('reposição (refill)', () => {
  const b: Bucket = { capacity: 100, refillPerMinute: 2, tokens: 0, updatedAt: T0 };
  it.each([
    [0, 0], [29_999, 0], [30_000, 1], [MIN, 2], [10 * MIN, 20], [50 * MIN, 100], [500 * MIN, 100],
  ])('PF vazio depois de %i ms tem %i fichas', (ms, tokens) => expect(available(refill(b, T0 + ms))).toBe(tokens));

  it('relógio voltando não tira fichas nem volta o updatedAt', () => {
    const r = refill({ ...b, tokens: 10 }, T0 - MIN);
    expect(r.tokens).toBe(10);
    expect(r.updatedAt).toBe(T0);
  });

  it('o 429 deixa de acontecer depois da reposição', () => {
    const s = withTokens(fresh(), { id: 'pf', key: 'CPF' }, 0);
    expect(consultKey(s, { userId: 'pf', keyType: 'CPF', keyExists: true, now: T0 + 29_000 }).status).toBe(429);
    expect(consultKey(s, { userId: 'pf', keyType: 'CPF', keyExists: true, now: T0 + 30_000 }).status).toBe(200);
  });

  it('refillAll repõe usuários e participante', () => {
    let s = withTokens(fresh('H'), 'participant', 0);
    s = withTokens(s, { id: 'pj', key: 'PHONE' }, 0);
    const r = refillAll(s, T0 + MIN);
    expect(available(r.participant)).toBe(2);
    expect(userTokens(r, 'pj', 'PHONE')).toBe(20);
  });
});

describe('pagamento devolve fichas (mesmo endToEndId)', () => {
  it('PF: +1 no balde da política da consulta e +1 no participante', () => {
    const c = consultKey(fresh(), { userId: 'pf', keyType: 'EMAIL', keyExists: true, now: T0 });
    expect(c.consultationId).toMatch(/^E03311443\d{8}$/);
    const p = sendPayment(c.state, { consultationId: c.consultationId!, now: T0 });
    expect(p).toMatchObject({ ok: true, refunded: { user: 1, participant: 1 } });
    // como o balde estava cheio, a consulta (−1) e o pagamento (+1) se anulam
    expect(userTokens(p.state, 'pf', 'EMAIL')).toBe(100);
    expect(available(p.state.participant)).toBe(500);
  });

  it('PJ devolve 2, mas nunca passa do teto', () => {
    let s = withTokens(fresh(), { id: 'pj', key: 'CNPJ' }, 500);
    const c = consultKey(s, { userId: 'pj', keyType: 'CNPJ', keyExists: true, now: T0 });
    s = sendPayment(c.state, { consultationId: c.consultationId!, now: T0 }).state;
    expect(userTokens(s, 'pj', 'CNPJ')).toBe(501);

    const full = consultKey(fresh(), { userId: 'pj', keyType: 'CNPJ', keyExists: true, now: T0 });
    expect(userTokens(sendPayment(full.state, { consultationId: full.consultationId!, now: T0 }).state, 'pj', 'CNPJ')).toBe(1000);
  });

  it('o mesmo endToEndId só devolve uma vez', () => {
    const c = consultKey(withTokens(fresh(), { id: 'pf', key: 'CPF' }, 50), { userId: 'pf', keyType: 'CPF', keyExists: true, now: T0 });
    const p1 = sendPayment(c.state, { consultationId: c.consultationId!, now: T0 });
    const p2 = sendPayment(p1.state, { consultationId: c.consultationId!, now: T0 });
    expect(p2).toMatchObject({ ok: false, reason: 'JA_PAGA' });
    expect(userTokens(p2.state, 'pf', 'CPF')).toBe(50);
  });

  it('consulta 404 não gera endToEndId; id desconhecido não devolve nada', () => {
    const c = consultKey(fresh(), { userId: 'pf', keyType: 'CPF', keyExists: false, now: T0 });
    expect(c.consultationId).toBeUndefined();
    expect(sendPayment(c.state, { consultationId: 'E000', now: T0 })).toMatchObject({ ok: false, reason: 'CONSULTA_DESCONHECIDA' });
  });
});

describe('categoria do participante', () => {
  it('trocar a categoria troca tamanho e reposição e enche o balde', () => {
    const s = setCategory(withTokens(fresh('F'), 'participant', 3), 'H', T0);
    expect(s.participant).toMatchObject({ capacity: 50, refillPerMinute: 2, tokens: 50 });
  });
});

describe('propriedades (fast-check): valem para qualquer sequência de operações', () => {
  const op = fc.record({
    user: fc.constantFrom('pf', 'pj'),
    key: fc.constantFrom<KeyType>('EMAIL', 'PHONE', 'CPF', 'CNPJ', 'EVP'),
    exists: fc.boolean(),
    pay: fc.boolean(),
    advanceMs: fc.integer({ min: 0, max: 5 * MIN }),
  });

  it('nenhum balde fica negativo nem passa do teto; 429 nunca cobra', () => {
    fc.assert(fc.property(fc.constantFrom<ParticipantCategory>('A', 'F', 'G', 'H'), fc.array(op, { maxLength: 80 }), (cat, ops) => {
      let s = fresh(cat);
      let now = T0;
      for (const o of ops) {
        now += o.advanceMs;
        const before = refillAll(s, now);
        const r = consultKey(s, { userId: o.user, keyType: o.key, keyExists: o.exists, now });
        if (r.status === 429) expect(r.state).toEqual(before);
        s = r.state;
        if (o.pay && r.consultationId) s = sendPayment(s, { consultationId: r.consultationId, now }).state;
        for (const b of [s.participant, ...Object.values(s.users).flatMap((u) => Object.values(u.buckets))]) {
          expect(b.tokens).toBeGreaterThanOrEqual(0);
          expect(b.tokens).toBeLessThanOrEqual(b.capacity);
        }
      }
    }), { numRuns: 300 });
  });

  it('as funções não alteram o estado recebido (imutabilidade)', () => {
    fc.assert(fc.property(op, (o) => {
      const s = fresh();
      const snapshot = structuredClone(s);
      const r = consultKey(s, { userId: o.user, keyType: o.key, keyExists: o.exists, now: T0 + o.advanceMs });
      if (r.consultationId) sendPayment(r.state, { consultationId: r.consultationId, now: T0 });
      expect(s).toEqual(snapshot);
    }));
  });
});
