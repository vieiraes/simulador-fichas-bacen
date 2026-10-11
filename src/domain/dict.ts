/**
 * Regras de limitação de consultas do DICT (Diretório de Identificadores de Contas Transacionais do Pix).
 *
 * O DICT usa o algoritmo token bucket ("balde de fichas"). Cada consulta de chave (getEntry) passa por
 * três baldes ao mesmo tempo: dois do usuário final (um por grupo de tipo de chave) e um do participante (ISPB).
 *
 * Fonte: especificação da API do DICT, seção "Limitação de requisições", reproduzida em
 * https://developers.openpix.com.br/en/dict (DICT API 2.4.3) e changelog oficial em
 * https://www.bcb.gov.br/content/estabilidadefinanceira/pix/changelog.html
 *
 * Tudo aqui é função pura: recebe o estado e o instante (ms) e devolve um estado novo. Sem React, sem relógio global.
 */

export type PersonType = 'PF' | 'PJ';
export type KeyType = 'EMAIL' | 'PHONE' | 'CPF' | 'CNPJ' | 'EVP';
export type ParticipantCategory = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
export type UserPolicy = 'ENTRIES_READ_USER_ANTISCAN' | 'ENTRIES_READ_USER_ANTISCAN_V2';

export interface BucketConfig {
  capacity: number;
  refillPerMinute: number;
}

/** Balde do usuário final, por tipo de pessoa (vale para as duas políticas de usuário). */
export const USER_BUCKETS: Record<PersonType, BucketConfig> = {
  PF: { capacity: 100, refillPerMinute: 2 },
  PJ: { capacity: 1000, refillPerMinute: 20 },
};

/** Balde do participante (ENTRIES_READ_PARTICIPANT_ANTISCAN), pela categoria do PSP. */
export const PARTICIPANT_BUCKETS: Record<ParticipantCategory, BucketConfig> = {
  A: { capacity: 50_000, refillPerMinute: 25_000 },
  B: { capacity: 40_000, refillPerMinute: 20_000 },
  C: { capacity: 30_000, refillPerMinute: 15_000 },
  D: { capacity: 16_000, refillPerMinute: 8_000 },
  E: { capacity: 5_000, refillPerMinute: 2_500 },
  F: { capacity: 500, refillPerMinute: 250 },
  G: { capacity: 250, refillPerMinute: 25 },
  H: { capacity: 50, refillPerMinute: 2 },
};

/** Regras de contagem: quanto cada resposta tira e quanto o pagamento devolve. */
export const COUNTING = {
  user: { found: 1, notFound: 20, paymentRefund: { PF: 1, PJ: 2 } as Record<PersonType, number> },
  participant: { found: 1, notFound: 3, paymentRefund: 1 },
} as const;

/** EMAIL e PHONE contam no ANTISCAN; CPF, CNPJ e EVP no ANTISCAN_V2. */
export function policyForKey(keyType: KeyType): UserPolicy {
  return keyType === 'EMAIL' || keyType === 'PHONE' ? 'ENTRIES_READ_USER_ANTISCAN' : 'ENTRIES_READ_USER_ANTISCAN_V2';
}

export interface Bucket extends BucketConfig {
  /** Fichas no instante `updatedAt`. Pode ser fracionário: a reposição é contínua. */
  tokens: number;
  updatedAt: number;
}

export interface UserState {
  id: string;
  name: string;
  personType: PersonType;
  buckets: Record<UserPolicy, Bucket>;
}

export interface Consultation {
  id: string;
  userId: string;
  policy: UserPolicy;
  /** Pagamento já enviado com este endToEndId? A devolução de fichas só vale uma vez. */
  paid: boolean;
}

export interface DictState {
  ispb: string;
  category: ParticipantCategory;
  participant: Bucket;
  users: Record<string, UserState>;
  consultations: Record<string, Consultation>;
  seq: number;
}

export const newBucket = (cfg: BucketConfig, now: number): Bucket => ({ ...cfg, tokens: cfg.capacity, updatedAt: now });

/** Reposição contínua até o teto. `now` anterior a `updatedAt` não tira fichas (relógio nunca volta). */
export function refill(b: Bucket, now: number): Bucket {
  const elapsedMin = Math.max(0, now - b.updatedAt) / 60_000;
  return { ...b, tokens: Math.min(b.capacity, b.tokens + elapsedMin * b.refillPerMinute), updatedAt: Math.max(now, b.updatedAt) };
}

/** Fichas inteiras disponíveis (o que a tela e as decisões usam). */
export const available = (b: Bucket) => Math.floor(b.tokens + 1e-9);

/**
 * Tira fichas sem deixar o balde negativo. A especificação diz apenas que, com o balde em zero, a resposta é 429;
 * ela não define saldo negativo. Por isso o simulador zera no mínimo (decisão documentada no README).
 */
const take = (b: Bucket, n: number): Bucket => ({ ...b, tokens: Math.max(0, b.tokens - n) });
const give = (b: Bucket, n: number): Bucket => ({ ...b, tokens: Math.min(b.capacity, b.tokens + n) });

export function createState(opts: {
  now: number;
  ispb?: string;
  category?: ParticipantCategory;
  users: { id: string; name: string; personType: PersonType }[];
}): DictState {
  const users: Record<string, UserState> = {};
  for (const u of opts.users) {
    const cfg = USER_BUCKETS[u.personType];
    users[u.id] = {
      ...u,
      buckets: { ENTRIES_READ_USER_ANTISCAN: newBucket(cfg, opts.now), ENTRIES_READ_USER_ANTISCAN_V2: newBucket(cfg, opts.now) },
    };
  }
  const category = opts.category ?? 'F';
  return { ispb: opts.ispb ?? '03311443', category, participant: newBucket(PARTICIPANT_BUCKETS[category], opts.now), users, consultations: {}, seq: 0 };
}

/** Troca a categoria do participante: o balde passa a ter o tamanho e a reposição da nova categoria (enche). */
export function setCategory(s: DictState, category: ParticipantCategory, now: number): DictState {
  return { ...s, category, participant: newBucket(PARTICIPANT_BUCKETS[category], now) };
}

/** Atualiza todos os baldes até `now` (a tela chama a cada tique do relógio). */
export function refillAll(s: DictState, now: number): DictState {
  const users: Record<string, UserState> = {};
  for (const [id, u] of Object.entries(s.users)) {
    users[id] = { ...u, buckets: { ENTRIES_READ_USER_ANTISCAN: refill(u.buckets.ENTRIES_READ_USER_ANTISCAN, now), ENTRIES_READ_USER_ANTISCAN_V2: refill(u.buckets.ENTRIES_READ_USER_ANTISCAN_V2, now) } };
  }
  return { ...s, users, participant: refill(s.participant, now) };
}

export type ConsultStatus = 200 | 404 | 429;

export interface ConsultResult {
  state: DictState;
  status: ConsultStatus;
  /** Quem bloqueou, quando 429. */
  limitedBy?: UserPolicy | 'ENTRIES_READ_PARTICIPANT_ANTISCAN';
  /** endToEndId da consulta 200, usado depois no pagamento para devolver as fichas. */
  consultationId?: string;
  spent?: { user: number; participant: number };
}

/**
 * Consulta de chave (getEntry). Com qualquer um dos dois baldes envolvidos em zero, responde 429 e não cobra nada.
 * Senão, cobra conforme o resultado: chave existe (200) ou não existe (404).
 */
export function consultKey(s0: DictState, input: { userId: string; keyType: KeyType; keyExists: boolean; now: number }): ConsultResult {
  const user0 = s0.users[input.userId];
  if (!user0) throw new Error(`usuário desconhecido: ${input.userId}`);
  const s = refillAll(s0, input.now);
  const user = s.users[input.userId];
  const policy = policyForKey(input.keyType);

  if (available(user.buckets[policy]) < 1) return { state: s, status: 429, limitedBy: policy };
  if (available(s.participant) < 1) return { state: s, status: 429, limitedBy: 'ENTRIES_READ_PARTICIPANT_ANTISCAN' };

  const userCost = input.keyExists ? COUNTING.user.found : COUNTING.user.notFound;
  const partCost = input.keyExists ? COUNTING.participant.found : COUNTING.participant.notFound;
  const next: DictState = {
    ...s,
    seq: s.seq + 1,
    participant: take(s.participant, partCost),
    users: { ...s.users, [user.id]: { ...user, buckets: { ...user.buckets, [policy]: take(user.buckets[policy], userCost) } } },
  };
  if (!input.keyExists) return { state: next, status: 404, spent: { user: userCost, participant: partCost } };

  const id = `E${s.ispb}${String(next.seq).padStart(8, '0')}`;
  next.consultations = { ...s.consultations, [id]: { id, userId: user.id, policy, paid: false } };
  return { state: next, status: 200, consultationId: id, spent: { user: userCost, participant: partCost } };
}

export interface PaymentResult {
  state: DictState;
  ok: boolean;
  reason?: 'CONSULTA_DESCONHECIDA' | 'JA_PAGA';
  refunded?: { user: number; participant: number };
}

/**
 * Ordem de pagamento enviada após uma consulta 200 (mesmo endToEndId): devolve fichas ao balde do usuário
 * (+1 PF, +2 PJ) e ao do participante (+1), sem passar do teto. Só vale uma vez por consulta.
 */
export function sendPayment(s0: DictState, input: { consultationId: string; now: number }): PaymentResult {
  const c = s0.consultations[input.consultationId];
  if (!c) return { state: s0, ok: false, reason: 'CONSULTA_DESCONHECIDA' };
  if (c.paid) return { state: s0, ok: false, reason: 'JA_PAGA' };
  const s = refillAll(s0, input.now);
  const user = s.users[c.userId];
  const userRefund = COUNTING.user.paymentRefund[user.personType];
  const partRefund = COUNTING.participant.paymentRefund;
  return {
    ok: true,
    refunded: { user: userRefund, participant: partRefund },
    state: {
      ...s,
      participant: give(s.participant, partRefund),
      users: { ...s.users, [user.id]: { ...user, buckets: { ...user.buckets, [c.policy]: give(user.buckets[c.policy], userRefund) } } },
      consultations: { ...s.consultations, [c.id]: { ...c, paid: true } },
    },
  };
}

/** Quantas consultas 404 seguidas um balde aguenta antes do 429 (útil na tela e nos testes). */
export const scansUntilBlocked = (tokens: number) => Math.ceil(Math.floor(tokens) / COUNTING.user.notFound);
