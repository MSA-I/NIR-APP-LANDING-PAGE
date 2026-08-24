import { useState } from 'react';
import type { Dict } from '../../content/he';
import { track } from '../../lib/analytics';
import { handleRadioKey } from '../../lib/radiogroup';

type Role = 'owner' | 'office' | 'accountant';

export default function AssistantShowcase({ dict, asOf }: { dict: Dict; asOf: string }) {
  const a = dict.assistant;
  const roleLabels: Record<Role, string> = {
    owner: dict.roles.tabs[0].label,
    office: dict.roles.tabs[1].label,
    accountant: dict.roles.tabs[2].label,
  };
  const [role, setRole] = useState<Role>('owner');
  const [runId, setRunId] = useState(a.runs[0].id);
  const run = a.runs.find((r) => r.id === runId) ?? a.runs[0];
  const permitted = (run.roles as readonly string[]).includes(role);

  return (
    <div className="asst">
      <div className="asst-side">
        <div className="asst-group">
          <span className="asst-label" id="asst-role-label">
            {a.roleLabel}
          </span>
          <div className="asst-pills" role="radiogroup" aria-labelledby="asst-role-label">
            {(Object.keys(roleLabels) as Role[]).map((r, i, all) => (
              <button
                key={r}
                role="radio"
                aria-checked={role === r}
                tabIndex={role === r ? 0 : -1}
                className={`asst-pill ${role === r ? 'on' : ''}`}
                onClick={() => setRole(r)}
                onKeyDown={(e) => handleRadioKey(e, all.length, all.indexOf(role), (n) => setRole(all[n] as Role))}
              >
                {roleLabels[r]}
              </button>
            ))}
          </div>
        </div>
        <div className="asst-group">
          <span className="asst-label" id="asst-q-label">
            {a.tryLabel}
          </span>
          <div className="asst-questions" role="radiogroup" aria-labelledby="asst-q-label">
            {a.runs.map((r, i, all) => (
              <button
                key={r.id}
                role="radio"
                aria-checked={runId === r.id}
                tabIndex={runId === r.id ? 0 : -1}
                className={`asst-q ${runId === r.id ? 'on' : ''}`}
                onClick={() => {
                  setRunId(r.id);
                  track('assistant_example_run', { run: r.id, role, permitted: (r.roles as readonly string[]).includes(role) });
                }}
                onKeyDown={(e) =>
                  handleRadioKey(e, all.length, all.findIndex((x) => x.id === runId), (n) => {
                    setRunId(all[n].id);
                    track('assistant_example_run', { run: all[n].id, role, permitted: (all[n].roles as readonly string[]).includes(role) });
                  })
                }
              >
                {r.question}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="asst-card card" aria-live="polite">
        <p className="asst-question">{run.question}</p>
        {permitted ? (
          <>
            <p className="asst-answer">{run.answer}</p>
            <dl className="asst-facts">
              {run.facts.map((f) => (
                <div key={f.label} className="asst-fact">
                  <dt>{f.label}</dt>
                  <dd className="num">{f.value}</dd>
                </div>
              ))}
            </dl>
            <div className="asst-meta">
              <span className="badge badge-done">{a.stateLabels.complete}</span>
              <span className="asst-window">{a.windowLabel}</span>
              <span className="asst-window">{asOf}</span>
            </div>
            <div className="asst-foot">
              <span className="asst-source">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
                </svg>
                {run.source}
              </span>
              <a className="asst-open" href="#demo" onClick={() => track('assistant_source_opened', { run: run.id, role })}>
                {a.openSource}
              </a>
            </div>
          </>
        ) : (
          <>
            <p className="asst-answer muted">{'notPermittedAnswer' in run ? run.notPermittedAnswer : a.stateLabels.not_permitted}</p>
            <div className="asst-meta">
              <span className="badge badge-idle">{a.stateLabels.not_permitted}</span>
              <span className="asst-window">{asOf}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
