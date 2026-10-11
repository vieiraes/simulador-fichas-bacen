import { useState } from 'react';
import {
  COUNTING, PARTICIPANT_BUCKETS, USER_BUCKETS, available, policyForKey,
  type Bucket, type KeyType, type ParticipantCategory, type UserPolicy,
} from '../domain/dict';
import { USERS, useSimulation, type LogEntry } from './useSimulation';

const KEY_TYPES: KeyType[] = ['CPF', 'CNPJ', 'EVP', 'EMAIL', 'PHONE'];
const CATEGORIES = Object.keys(PARTICIPANT_BUCKETS) as ParticipantCategory[];
const SPEEDS = [1, 10, 60, 600];
const POLICY_LABEL: Record<UserPolicy, string> = {
  ENTRIES_READ_USER_ANTISCAN: 'Usuário · EMAIL e PHONE',
  ENTRIES_READ_USER_ANTISCAN_V2: 'Usuário · CPF, CNPJ e EVP',
};
const fmtTime = (ms: number) => new Date(ms).toLocaleTimeString('pt-BR');
const num = (n: number) => n.toLocaleString('pt-BR');

function Gauge({ id, title, policy, bucket, active }: { id: string; title: string; policy: string; bucket: Bucket; active: boolean }) {
  const tokens = available(bucket);
  const pct = (tokens / bucket.capacity) * 100;
  const level = tokens === 0 ? 'empty' : pct < 20 ? 'low' : 'ok';
  return (
    <section className={`gauge ${active ? 'active' : ''} ${level}`} data-testid={`bucket-${id}`} aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`}>{title}</h3>
      <p className="policy"><code>{policy}</code></p>
      <p className="tokens"><span data-testid={`tokens-${id}`}>{num(tokens)}</span> <small>/ {num(bucket.capacity)} fichas</small></p>
      <div className="bar" role="progressbar" aria-label={`${title}: ${tokens} de ${bucket.capacity} fichas`} aria-valuemin={0} aria-valuemax={bucket.capacity} aria-valuenow={tokens}>
        <div style={{ width: `${pct}%` }} />
      </div>
      <p className="refill">repõe {num(bucket.refillPerMinute)}/min{tokens === 0 && <strong> · vazio: próxima consulta recebe 429</strong>}</p>
    </section>
  );
}

const statusClass = (s: LogEntry['status']) => (s === 200 || s === 'PAGO' ? 'ok' : s === 404 ? 'warn' : 'err');

export function App() {
  const sim = useSimulation();
  const [userId, setUserId] = useState(USERS[0].id);
  const [keyType, setKeyType] = useState<KeyType>('CPF');
  const user = sim.state.users[userId];
  const activePolicy = policyForKey(keyType);

  return (
    <div className="page">
      <header className="hero">
        <h1>Simulador de Fichas do DICT</h1>
        <p>
          Cada consulta de chave Pix no DICT do Banco Central gasta fichas de três baldes (<em>token bucket</em>): dois do usuário que paga
          e um da instituição (participante). Sem fichas, a resposta é <strong>HTTP 429</strong>. Faça consultas, envie o Pix e veja os baldes.
        </p>
      </header>

      <section className="panel" aria-labelledby="cfg-title">
        <h2 id="cfg-title">Cenário</h2>
        <div className="fields">
          <label>Quem consulta
            <select data-testid="user" value={userId} onChange={(e) => setUserId(e.target.value)}>
              {USERS.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.personType})</option>)}
            </select>
          </label>
          <label>Tipo de chave consultada
            <select data-testid="key-type" value={keyType} onChange={(e) => setKeyType(e.target.value as KeyType)}>
              {KEY_TYPES.map((k) => <option key={k}>{k}</option>)}
            </select>
          </label>
          <label>Categoria do participante (ISPB {sim.state.ispb})
            <select data-testid="category" value={sim.state.category} onChange={(e) => sim.changeCategory(e.target.value as ParticipantCategory)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c} · {num(PARTICIPANT_BUCKETS[c].capacity)} fichas</option>)}
            </select>
          </label>
          <label>Velocidade do relógio
            <select data-testid="speed" value={sim.speed} onChange={(e) => sim.setSpeed(Number(e.target.value))}>
              {SPEEDS.map((v) => <option key={v} value={v}>{v === 1 ? 'tempo real' : `${v}× mais rápido`}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="panel" aria-labelledby="ops-title">
        <h2 id="ops-title">Operações</h2>
        <div className="actions">
          <button data-testid="consult-found" onClick={() => sim.consult(userId, keyType, true)}>Consultar chave que existe <small>(200)</small></button>
          <button data-testid="consult-not-found" className="warn" onClick={() => sim.consult(userId, keyType, false)}>Consultar chave que não existe <small>(404)</small></button>
          <button data-testid="pay" className="ok" disabled={!sim.lastConsultation} onClick={sim.pay}>Enviar Pix da última consulta</button>
          <button data-testid="reset" className="ghost" onClick={sim.reset}>Recomeçar</button>
        </div>
      </section>

      <section className="buckets" aria-label="Baldes de fichas">
        <Gauge id="user-v1" title={POLICY_LABEL.ENTRIES_READ_USER_ANTISCAN} policy="ENTRIES_READ_USER_ANTISCAN" bucket={user.buckets.ENTRIES_READ_USER_ANTISCAN} active={activePolicy === 'ENTRIES_READ_USER_ANTISCAN'} />
        <Gauge id="user-v2" title={POLICY_LABEL.ENTRIES_READ_USER_ANTISCAN_V2} policy="ENTRIES_READ_USER_ANTISCAN_V2" bucket={user.buckets.ENTRIES_READ_USER_ANTISCAN_V2} active={activePolicy === 'ENTRIES_READ_USER_ANTISCAN_V2'} />
        <Gauge id="participant" title={`Participante · categoria ${sim.state.category}`} policy="ENTRIES_READ_PARTICIPANT_ANTISCAN" bucket={sim.state.participant} active />
      </section>

      <section className="panel" aria-labelledby="log-title">
        <h2 id="log-title">Respostas</h2>
        {sim.log.length === 0 && <p className="muted">Nenhuma operação ainda.</p>}
        <ol className="log" aria-live="polite" aria-label="Histórico de respostas" tabIndex={0} data-testid="log">
          {sim.log.map((e) => (
            <li key={e.id} className={statusClass(e.status)}>
              <span className="status" data-testid="status">{e.status}</span>
              <span className="what"><strong>{e.action}</strong><br />{e.detail}</span>
              <time>{fmtTime(e.at)}</time>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel rules" aria-labelledby="rules-title">
        <h2 id="rules-title">A regra</h2>
        <div className="table-wrap" tabIndex={0} role="region" aria-label="Tabela da regra (role para os lados no celular)">
          <table>
            <caption>Quanto cada evento mexe em cada balde</caption>
            <thead><tr><th scope="col">Evento</th><th scope="col">Usuário PF</th><th scope="col">Usuário PJ</th><th scope="col">Participante</th></tr></thead>
            <tbody>
              <tr><th scope="row">Consulta com chave encontrada (200)</th><td>−{COUNTING.user.found}</td><td>−{COUNTING.user.found}</td><td>−{COUNTING.participant.found}</td></tr>
              <tr><th scope="row">Consulta com chave inexistente (404)</th><td>−{COUNTING.user.notFound}</td><td>−{COUNTING.user.notFound}</td><td>−{COUNTING.participant.notFound}</td></tr>
              <tr><th scope="row">Pix enviado (mesmo endToEndId)</th><td>+{COUNTING.user.paymentRefund.PF}</td><td>+{COUNTING.user.paymentRefund.PJ}</td><td>+{COUNTING.participant.paymentRefund}</td></tr>
              <tr><th scope="row">Tamanho do balde</th><td>{USER_BUCKETS.PF.capacity}</td><td>{num(USER_BUCKETS.PJ.capacity)}</td><td>50 a 50.000 (categoria H a A)</td></tr>
              <tr><th scope="row">Reposição</th><td>{USER_BUCKETS.PF.refillPerMinute}/min</td><td>{USER_BUCKETS.PJ.refillPerMinute}/min</td><td>2 a 25.000/min</td></tr>
            </tbody>
          </table>
        </div>
        <ul className="notes">
          <li>O usuário tem dois baldes: EMAIL e PHONE contam em <code>ENTRIES_READ_USER_ANTISCAN</code>; CPF, CNPJ e EVP em <code>…_V2</code>.</li>
          <li>Com qualquer balde envolvido em zero, o DICT responde <strong>429</strong> e não cobra fichas.</li>
          <li>Hipótese do simulador: a especificação não define saldo negativo, então uma cobrança maior que o saldo zera o balde.</li>
        </ul>
        <p className="muted">Fonte: especificação da API do DICT, seção "Limitação de requisições" (<a href="https://developers.openpix.com.br/en/dict">cópia pública da OpenPix</a>) e <a href="https://www.bcb.gov.br/content/estabilidadefinanceira/pix/changelog.html">changelog do BCB</a>. Simulação educativa, não é ferramenta oficial.</p>
      </section>

      <footer className="foot">
        <a href="https://github.com/vieiraes/simulador-fichas-bacen">Código, testes e estratégia de QA no GitHub</a>
      </footer>
    </div>
  );
}
