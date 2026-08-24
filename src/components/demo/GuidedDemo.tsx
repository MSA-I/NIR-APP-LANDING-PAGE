import { useMemo, useState } from 'react';
import type { Dict } from '../../content/he';
import { getFixtures, type RoleId, type ScenarioId } from '../../content/fixtures';
import type { Locale } from '../../lib/i18n';

const stateToBadge: Record<string, string> = {
  done: 'badge-done',
  alert: 'badge-alert',
  await: 'badge-await',
  idle: 'badge-idle',
};

export default function GuidedDemo({ dict, locale, pilotHref }: { dict: Dict; locale: Locale; pilotHref: string }) {
  const d = dict.demo;
  const fixtures = useMemo(() => getFixtures(locale), [locale]);
  const [role, setRole] = useState<RoleId>('owner');
  const [scenarioId, setScenarioId] = useState<ScenarioId>('price');
  const scenario = fixtures.scenarios.find((s) => s.id === scenarioId) ?? fixtures.scenarios[0];
  const access = scenario.access[role];
  const roleLabels: Record<RoleId, string> = {
    owner: dict.roles.tabs[0].label,
    office: dict.roles.tabs[1].label,
    accountant: dict.roles.tabs[2].label,
  };

  return (
    <div className="gdemo" data-demo-root>
      <div className="gdemo-controls">
        <div className="gdemo-group">
          <span className="gdemo-label" id="gd-role">
            {d.stepRole}
          </span>
          <div className="asst-pills" role="radiogroup" aria-labelledby="gd-role">
            {(Object.keys(roleLabels) as RoleId[]).map((r) => (
              <button key={r} role="radio" aria-checked={role === r} className={`asst-pill ${role === r ? 'on' : ''}`} onClick={() => setRole(r)}>
                {roleLabels[r]}
              </button>
            ))}
          </div>
        </div>
        <div className="gdemo-group">
          <span className="gdemo-label" id="gd-scenario">
            {d.stepScenario}
          </span>
          <div className="asst-pills" role="radiogroup" aria-labelledby="gd-scenario">
            {d.scenarios.map((s) => (
              <button
                key={s.id}
                role="radio"
                aria-checked={scenarioId === s.id}
                className={`asst-pill ${scenarioId === s.id ? 'on' : ''}`}
                onClick={() => setScenarioId(s.id as ScenarioId)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <span className="badge badge-info gdemo-badge">{d.demoBadge}</span>
      </div>

      <div className="gdemo-body" aria-live="polite">
        <div className="gdemo-evidence">
          <h4>{d.evidenceTitle}</h4>
          {access.kind === 'full' ? (
            <ul className="gdemo-chain">
              {scenario.chain.map((row) => (
                <li key={row.label}>
                  <span>
                    <bdi>{row.label}</bdi>
                  </span>
                  <span className={`badge ${stateToBadge[row.state]} num`}>{row.value}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="gdemo-finding-card" style={{ background: 'var(--surface-sunken)' }}>
              <p style={{ color: 'var(--ink-mid)' }}>{access.note}</p>
              <div className="gdemo-finding-meta">
                <span className="badge badge-idle">{dict.assistant.stateLabels.not_permitted}</span>
              </div>
            </div>
          )}
        </div>
        <div className="gdemo-finding">
          <h4>{d.askAssistant}</h4>
          {access.kind === 'full' ? (
            <div className="gdemo-finding-card">
              <p>{scenario.finding}</p>
              <div className="gdemo-finding-meta">
                {scenario.findingFacts.map((f) => (
                  <span key={f.label} className="badge badge-info num">
                    {f.label}: {f.value}
                  </span>
                ))}
              </div>
              <div className="gdemo-finding-meta">
                <span>{dict.assistant.asOfLabel}</span>
              </div>
            </div>
          ) : (
            <div className="gdemo-finding-card" style={{ background: 'var(--surface-sunken)' }}>
              <p style={{ color: 'var(--ink-mid)' }}>{dict.assistant.stateLabels.not_permitted}</p>
            </div>
          )}
        </div>
      </div>

      <div className="gdemo-summary">
        <p>
          <strong>{d.summaryTitle}:</strong> {access.kind === 'full' ? scenario.summary : access.note}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <button className="gdemo-restart" onClick={() => setScenarioId(fixtures.scenarios[(fixtures.scenarios.findIndex((s) => s.id === scenarioId) + 1) % fixtures.scenarios.length].id)}>
            {d.restart}
          </button>
          <a className="btn btn-onyx" href={pilotHref}>
            {d.ctaPilot}
          </a>
        </div>
      </div>
    </div>
  );
}
