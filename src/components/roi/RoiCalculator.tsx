import { useState } from 'react';
import type { Dict } from '../../content/he';
import type { Locale } from '../../lib/i18n';
import { trackOnce } from '../../lib/analytics';

const INTL: Record<Locale, { tag: string; currency: string }> = {
  he: { tag: 'he-IL', currency: 'ILS' },
  en: { tag: 'en-US', currency: 'USD' },
  fr: { tag: 'fr-FR', currency: 'USD' },
};

/* Scenario factors are shown in the UI (language-neutral) so the range is honest. */
const SCENARIOS = [
  { key: 'conservative' as const, factor: 0.5 },
  { key: 'base' as const, factor: 1 },
  { key: 'optimistic' as const, factor: 1.5 },
];

export default function RoiCalculator({ dict, locale }: { dict: Dict; locale: Locale }) {
  const r = dict.roi;
  const { tag, currency } = INTL[locale];
  const [docs, setDocs] = useState(120);
  const [minutes, setMinutes] = useState(6);
  const [hourly, setHourly] = useState(locale === 'he' ? 65 : 18);
  const [spend, setSpend] = useState(locale === 'he' ? 85000 : 25000);
  const [variance, setVariance] = useState(2);
  const [recoverable, setRecoverable] = useState(40);
  const [cost, setCost] = useState(locale === 'he' ? 249 : 79);
  const [edited, setEdited] = useState(false);

  const money = (v: number) =>
    new Intl.NumberFormat(tag, { style: 'currency', currency, maximumFractionDigits: 0 }).format(Math.round(v));
  const num = (v: number, digits = 1) => new Intl.NumberFormat(tag, { maximumFractionDigits: digits }).format(v);

  const rows = SCENARIOS.map(({ key, factor }) => {
    const hoursSaved = (docs * minutes * factor) / 60;
    const operational = hoursSaved * hourly;
    const leakage = spend * (variance / 100) * (recoverable / 100) * factor;
    const monthly = operational + leakage;
    const yearly = monthly * 12;
    const annualCost = cost * 12;
    const roi = annualCost > 0 ? (yearly - annualCost) / annualCost : 0;
    return { key, factor, hoursSaved, leakage, monthly, yearly, roi };
  });

  const fields: { id: string; label: string; value: number; set: (n: number) => void; step?: number }[] = [
    { id: 'docs', label: r.inputs.docs, value: docs, set: setDocs },
    { id: 'minutes', label: r.inputs.minutes, value: minutes, set: setMinutes },
    { id: 'hourly', label: r.inputs.hourly, value: hourly, set: setHourly },
    { id: 'spend', label: r.inputs.spend, value: spend, set: setSpend, step: 1000 },
    { id: 'variance', label: r.inputs.variance, value: variance, set: setVariance, step: 0.5 },
    { id: 'recoverable', label: r.inputs.recoverable, value: recoverable, set: setRecoverable, step: 5 },
    { id: 'cost', label: r.inputs.cost, value: cost, set: setCost },
  ];

  return (
    <div className="roi">
      <div className="roi-inputs">
        {fields.map((f) => (
          <div key={f.id} className="roi-field">
            <label htmlFor={`roi-${f.id}`}>{f.label}</label>
            <input
              id={`roi-${f.id}`}
              type="number"
              inputMode="decimal"
              min={0}
              step={f.step ?? 1}
              value={f.value}
              onChange={(e) => {
                f.set(Math.max(0, Number(e.target.value) || 0));
                setEdited(true);
                // §16.3: the visitor translated the product into their own numbers.
                trackOnce('roi_completed', { field: f.id });
              }}
            />
          </div>
        ))}
      </div>

      <div className="roi-results card">
        <h3>{r.results.title}</h3>
        <div className="roi-scroll">
        <table className="roi-table">
          <thead>
            <tr>
              <th scope="col"></th>
              {rows.map((row) => (
                <th key={row.key} scope="col">
                  {r.results[row.key]} <span className="num">(×{num(row.factor)})</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{r.results.timeSaved}</td>
              {rows.map((row) => (
                <td key={row.key} className="num">{num(row.hoursSaved)}</td>
              ))}
            </tr>
            <tr>
              <td>{r.results.leakage}</td>
              {rows.map((row) => (
                <td key={row.key} className="num">{money(row.leakage)}</td>
              ))}
            </tr>
            <tr>
              <td>{r.results.monthly}</td>
              {rows.map((row) => (
                <td key={row.key} className="num">{money(row.monthly)}</td>
              ))}
            </tr>
            <tr>
              <td>{r.results.yearly}</td>
              {rows.map((row) => (
                <td key={row.key} className="num">{money(row.yearly)}</td>
              ))}
            </tr>
            <tr>
              <td>{r.results.roi}</td>
              {rows.map((row) => (
                <td key={row.key} className="num">×{num(Math.max(0, row.roi + 1))}</td>
              ))}
            </tr>
          </tbody>
        </table>
        </div>
        <div className="roi-formula">
          <strong>{r.results.formulaTitle}</strong>
          {r.results.formula}
        </div>
        <p className="roi-disclaimer">
          {edited ? r.results.disclaimerEdited : r.results.disclaimerDefault} {r.results.disclaimer}
        </p>
      </div>
    </div>
  );
}
