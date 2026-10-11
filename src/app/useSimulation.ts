import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  consultKey, createState, refillAll, sendPayment, setCategory,
  type ConsultStatus, type DictState, type KeyType, type ParticipantCategory,
} from '../domain/dict';

export const USERS = [
  { id: 'maria', name: 'Maria Souza', personType: 'PF' as const },
  { id: 'padaria', name: 'Padaria Pão Quente Ltda', personType: 'PJ' as const },
];

export interface LogEntry {
  id: number;
  at: number; // instante simulado
  action: string;
  status: ConsultStatus | 'PAGO' | 'RECUSADO';
  detail: string;
}

interface Snapshot {
  state: DictState;
  log: LogEntry[];
  speed: number;
  lastConsultation: string | null;
}

/**
 * Estado da simulação fora do React (um store simples). Toda operação lê o estado mais recente,
 * então dois cliques no mesmo instante nunca usam o mesmo saldo (bug de corrida do app antigo).
 * O relógio é simulado: anda `speed` vezes mais rápido que o real. As regras ficam em src/domain/dict.ts.
 */
export class SimulationStore {
  private snap: Snapshot;
  private anchor: { real: number; sim: number };
  private listeners = new Set<() => void>();
  private seq = 0;

  constructor(now = Date.now()) {
    this.anchor = { real: now, sim: now };
    this.snap = { state: createState({ now, category: 'F', users: USERS }), log: [], speed: 1, lastConsultation: null };
  }

  subscribe = (fn: () => void) => { this.listeners.add(fn); return () => this.listeners.delete(fn); };
  getSnapshot = () => this.snap;

  private set(patch: Partial<Snapshot>) {
    this.snap = { ...this.snap, ...patch };
    this.listeners.forEach((fn) => fn());
  }

  private push(e: Omit<LogEntry, 'id'>) {
    return [{ ...e, id: ++this.seq }, ...this.snap.log].slice(0, 50);
  }

  now() { return this.anchor.sim + (Date.now() - this.anchor.real) * this.snap.speed; }

  tick() { this.set({ state: refillAll(this.snap.state, this.now()) }); }

  setSpeed(speed: number) {
    this.anchor = { real: Date.now(), sim: this.now() };
    this.set({ speed });
  }

  consult(userId: string, keyType: KeyType, keyExists: boolean) {
    const now = this.now();
    const r = consultKey(this.snap.state, { userId, keyType, keyExists, now });
    const who = USERS.find((u) => u.id === userId)!;
    this.set({
      state: r.state,
      lastConsultation: r.consultationId ?? this.snap.lastConsultation,
      log: this.push({
        at: now,
        action: `Consulta chave ${keyType} (${keyExists ? 'existe' : 'não existe'}) · ${who.personType}`,
        status: r.status,
        detail: r.status === 429
          ? `Bloqueado por ${r.limitedBy}. Nada foi cobrado.`
          : `−${r.spent!.user} usuário · −${r.spent!.participant} participante${r.consultationId ? ` · endToEndId ${r.consultationId}` : ''}`,
      }),
    });
  }

  pay() {
    const id = this.snap.lastConsultation;
    if (!id) return;
    const now = this.now();
    const r = sendPayment(this.snap.state, { consultationId: id, now });
    this.set({
      state: r.state,
      log: this.push({
        at: now,
        action: `Pix enviado (endToEndId ${id})`,
        status: r.ok ? 'PAGO' : 'RECUSADO',
        detail: r.ok ? `+${r.refunded!.user} usuário · +${r.refunded!.participant} participante` : r.reason === 'JA_PAGA' ? 'Esta consulta já foi paga: a devolução só vale uma vez.' : 'Consulta não encontrada.',
      }),
    });
  }

  changeCategory(c: ParticipantCategory) { this.set({ state: setCategory(this.snap.state, c, this.now()) }); }

  reset() {
    const now = Date.now();
    this.anchor = { real: now, sim: now };
    this.set({ state: createState({ now, category: this.snap.state.category, users: USERS }), log: [], lastConsultation: null });
  }
}

export function useSimulation() {
  const [store] = useState(() => new SimulationStore());
  const snap = useSyncExternalStore(store.subscribe, store.getSnapshot);
  useEffect(() => {
    const id = window.setInterval(() => store.tick(), 250);
    return () => clearInterval(id);
  }, [store]);
  return {
    ...snap,
    setSpeed: (v: number) => store.setSpeed(v),
    consult: (u: string, k: KeyType, e: boolean) => store.consult(u, k, e),
    pay: () => store.pay(),
    changeCategory: (c: ParticipantCategory) => store.changeCategory(c),
    reset: () => store.reset(),
  };
}
