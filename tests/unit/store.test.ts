import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { available } from '../../src/domain/dict';
import { SimulationStore } from '../../src/app/useSimulation';

const T0 = new Date('2026-10-11T12:00:00-03:00').getTime();
const v2 = (s: SimulationStore) => available(s.getSnapshot().state.users.maria.buckets.ENTRIES_READ_USER_ANTISCAN_V2);

describe('SimulationStore (camada da tela)', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(T0); });
  afterEach(() => vi.useRealTimers());

  it('regressão: cliques no mesmo instante usam sempre o saldo mais recente (bug de corrida do app antigo)', () => {
    const s = new SimulationStore(T0);
    for (let i = 0; i < 7; i++) s.consult('maria', 'CPF', false); // sem avançar o relógio
    expect(v2(s)).toBe(0);
    expect(s.getSnapshot().log.map((l) => l.status)).toEqual([429, 429, 404, 404, 404, 404, 404]);
  });

  it('o relógio simulado acelera a reposição e a troca de velocidade não perde tempo já passado', () => {
    const s = new SimulationStore(T0);
    s.consult('maria', 'CPF', false); // 80
    vi.advanceTimersByTime(60_000); // 1 min real a 1× = +2
    s.setSpeed(60);
    vi.advanceTimersByTime(1_000); // 1 s real a 60× = 1 min simulado = +2
    s.tick();
    expect(v2(s)).toBe(84);
  });

  it('Pix sem consulta não faz nada; reset limpa histórico e baldes', () => {
    const s = new SimulationStore(T0);
    s.pay();
    expect(s.getSnapshot().log).toHaveLength(0);
    s.consult('maria', 'CPF', true);
    s.pay();
    s.pay();
    expect(s.getSnapshot().log[0]).toMatchObject({ status: 'RECUSADO' });
    s.changeCategory('H');
    s.reset();
    expect(s.getSnapshot()).toMatchObject({ log: [], lastConsultation: null });
    expect(s.getSnapshot().state.category).toBe('H');
    expect(v2(s)).toBe(100);
  });
});
