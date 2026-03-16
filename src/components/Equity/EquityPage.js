import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AuthUserContext } from '../Session';
import { getEquityProfile, saveEquityProfile } from '../Firebase/equityService';
import './Equity.css';

const DEFAULT_ITEMS = [
  { label: 'Rent', amount: '' },
  { label: 'Electric', amount: '' },
  { label: 'Water / Sewer', amount: '' },
  { label: 'Internet', amount: '' },
];

const EMPTY_PROPERTY = {
  name: '',
  purchasePrice: '',
  downPaymentType: 'percent',
  downPaymentValue: '20',
  interestRate: '6.5',
  loanTermYears: '30',
  monthlyPaymentOverride: '',
  annualTaxRate: '1.25',
  annualInsurance: '1500',
  monthlyHoa: '0',
  annualMaintenancePct: '1',
  annualAppreciation: '3',
  expectedRentIncrease: '3',
};

const DEFAULT_SCENARIO = { mode: 'none', valueA: '', valueB: '' };

const fmt = (n) =>
  Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

function calcProperty(p) {
  const price = parseFloat(p.purchasePrice) || 0;
  if (price === 0) return null;

  const downPmt =
    p.downPaymentType === 'percent'
      ? price * ((parseFloat(p.downPaymentValue) || 0) / 100)
      : parseFloat(p.downPaymentValue) || 0;
  const loanAmount = Math.max(price - downPmt, 0);
  const monthlyRate = (parseFloat(p.interestRate) || 0) / 100 / 12;
  const numPayments = (parseFloat(p.loanTermYears) || 30) * 12;

  let calculatedMortgage = 0;
  if (loanAmount > 0 && monthlyRate > 0) {
    const factor = Math.pow(1 + monthlyRate, numPayments);
    calculatedMortgage = loanAmount * (monthlyRate * factor) / (factor - 1);
  } else if (loanAmount > 0) {
    calculatedMortgage = loanAmount / numPayments;
  }

  const override = parseFloat(p.monthlyPaymentOverride) || 0;
  const monthlyMortgage = override > 0 ? override : calculatedMortgage;

  const monthlyTax = (price * ((parseFloat(p.annualTaxRate) || 0) / 100)) / 12;
  const monthlyInsurance = (parseFloat(p.annualInsurance) || 0) / 12;
  const monthlyHoa = parseFloat(p.monthlyHoa) || 0;
  const monthlyMaintenance =
    (price * ((parseFloat(p.annualMaintenancePct) || 0) / 100)) / 12;

  const totalMonthlyCost =
    monthlyMortgage + monthlyTax + monthlyInsurance + monthlyHoa + monthlyMaintenance;

  const firstMonthInterest = loanAmount * monthlyRate;
  const firstMonthPrincipal = monthlyMortgage - firstMonthInterest;
  const monthlyAppreciation =
    (price * ((parseFloat(p.annualAppreciation) || 0) / 100)) / 12;
  const monthlyEquityGain = firstMonthPrincipal + monthlyAppreciation;

  return {
    price,
    downPmt,
    loanAmount,
    calculatedMortgage,
    monthlyMortgage,
    hasOverride: override > 0,
    monthlyTax,
    monthlyInsurance,
    monthlyHoa,
    monthlyMaintenance,
    totalMonthlyCost,
    firstMonthPrincipal,
    monthlyAppreciation,
    monthlyEquityGain,
  };
}

function buildColumns(properties, scenario) {
  if (scenario.mode === 'none' || !scenario.valueA || !scenario.valueB) {
    return properties.map((p, idx) => ({
      label: p.name || 'Untitled',
      property: p,
      calc: calcProperty(p),
      sourceIndex: idx,
    }));
  }

  const field =
    scenario.mode === 'interestRate' ? 'interestRate' : 'downPaymentValue';
  const suffix =
    scenario.mode === 'interestRate'
      ? (v) => `${v}% rate`
      : (v) => `${v}% down`;

  const cols = [];
  properties.forEach((p, idx) => {
    const name = p.name || 'Untitled';
    const a = { ...p, [field]: scenario.valueA };
    const b = { ...p, [field]: scenario.valueB };
    cols.push({
      label: `${name} (${suffix(scenario.valueA)})`,
      property: a,
      calc: calcProperty(a),
      sourceIndex: idx,
    });
    cols.push({
      label: `${name} (${suffix(scenario.valueB)})`,
      property: b,
      calc: calcProperty(b),
      sourceIndex: idx,
    });
  });
  return cols;
}

const ScenarioControls = ({ scenario, onChange }) => {
  const setMode = (mode) => {
    if (mode === scenario.mode) return;
    const defaults =
      mode === 'interestRate'
        ? { valueA: '6.5', valueB: '7.0' }
        : mode === 'downPayment'
        ? { valueA: '10', valueB: '20' }
        : { valueA: '', valueB: '' };
    onChange({ mode, ...defaults });
  };

  return (
    <div className="scenario-bar">
      <span className="scenario-label">Compare:</span>
      <div className="scenario-tabs">
        {['none', 'interestRate', 'downPayment'].map((m) => (
          <button
            key={m}
            className={`scenario-tab ${scenario.mode === m ? 'active' : ''}`}
            onClick={() => setMode(m)}
          >
            {m === 'none' ? 'None' : m === 'interestRate' ? 'Interest Rate' : 'Down Payment'}
          </button>
        ))}
      </div>
      {scenario.mode !== 'none' && (
        <div className="scenario-inputs">
          <div className="scenario-input-group">
            <span className="scenario-input-label">A</span>
            <div className="input-with-suffix compact">
              <input
                type="number"
                step="0.125"
                value={scenario.valueA}
                onChange={(e) => onChange({ ...scenario, valueA: e.target.value })}
              />
              <span className="suffix">
                {scenario.mode === 'interestRate' ? '%' : '% down'}
              </span>
            </div>
          </div>
          <span className="scenario-vs">vs</span>
          <div className="scenario-input-group">
            <span className="scenario-input-label">B</span>
            <div className="input-with-suffix compact">
              <input
                type="number"
                step="0.125"
                value={scenario.valueB}
                onChange={(e) => onChange({ ...scenario, valueB: e.target.value })}
              />
              <span className="suffix">
                {scenario.mode === 'interestRate' ? '%' : '% down'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PropertyForm = ({ property, onChange, onRemove, index }) => {
  const update = (field, value) => onChange(index, { ...property, [field]: value });

  return (
    <div className="property-card">
      <div className="property-card-header">
        <input
          className="property-name-input"
          type="text"
          placeholder={`Property ${index + 1} name (e.g. "Downtown Condo")`}
          value={property.name}
          onChange={(e) => update('name', e.target.value)}
        />
        <button className="remove-btn" onClick={() => onRemove(index)} title="Remove property">
          &times;
        </button>
      </div>

      <div className="property-form-grid">
        <label>
          <span>Purchase Price</span>
          <div className="input-with-prefix">
            <span className="prefix">$</span>
            <input
              type="number"
              min="0"
              step="1000"
              value={property.purchasePrice}
              onChange={(e) => update('purchasePrice', e.target.value)}
              placeholder="350000"
            />
          </div>
        </label>

        <label>
          <span>Down Payment</span>
          <div className="input-with-toggle">
            <input
              type="number"
              min="0"
              step="0.1"
              value={property.downPaymentValue}
              onChange={(e) => update('downPaymentValue', e.target.value)}
            />
            <button
              className="toggle-btn"
              type="button"
              onClick={() =>
                update('downPaymentType', property.downPaymentType === 'percent' ? 'dollar' : 'percent')
              }
            >
              {property.downPaymentType === 'percent' ? '%' : '$'}
            </button>
          </div>
        </label>

        <label>
          <span>Mortgage Interest Rate</span>
          <div className="input-with-suffix">
            <input
              type="number"
              min="0"
              step="0.125"
              value={property.interestRate}
              onChange={(e) => update('interestRate', e.target.value)}
            />
            <span className="suffix">%</span>
          </div>
        </label>

        <label>
          <span>Loan Term</span>
          <div className="input-with-suffix">
            <input
              type="number"
              min="1"
              max="50"
              step="1"
              value={property.loanTermYears}
              onChange={(e) => update('loanTermYears', e.target.value)}
            />
            <span className="suffix">yrs</span>
          </div>
        </label>

        <label>
          <span>Monthly Payment (optional override)</span>
          <div className="input-with-prefix">
            <span className="prefix">$</span>
            <input
              type="number"
              min="0"
              step="1"
              value={property.monthlyPaymentOverride}
              onChange={(e) => update('monthlyPaymentOverride', e.target.value)}
              placeholder="Auto-calculated"
            />
          </div>
        </label>

        <label>
          <span>Annual Property Tax Rate</span>
          <div className="input-with-suffix">
            <input
              type="number"
              min="0"
              step="0.01"
              value={property.annualTaxRate}
              onChange={(e) => update('annualTaxRate', e.target.value)}
            />
            <span className="suffix">%</span>
          </div>
        </label>

        <label>
          <span>Annual Home Insurance</span>
          <div className="input-with-prefix">
            <span className="prefix">$</span>
            <input
              type="number"
              min="0"
              step="100"
              value={property.annualInsurance}
              onChange={(e) => update('annualInsurance', e.target.value)}
            />
          </div>
        </label>

        <label>
          <span>Monthly HOA Fees</span>
          <div className="input-with-prefix">
            <span className="prefix">$</span>
            <input
              type="number"
              min="0"
              step="10"
              value={property.monthlyHoa}
              onChange={(e) => update('monthlyHoa', e.target.value)}
            />
          </div>
        </label>

        <label>
          <span>Annual Maintenance</span>
          <div className="input-with-suffix">
            <input
              type="number"
              min="0"
              step="0.1"
              value={property.annualMaintenancePct}
              onChange={(e) => update('annualMaintenancePct', e.target.value)}
            />
            <span className="suffix">%</span>
          </div>
        </label>

        <label>
          <span>Expected Annual Appreciation</span>
          <div className="input-with-suffix">
            <input
              type="number"
              step="0.1"
              value={property.annualAppreciation}
              onChange={(e) => update('annualAppreciation', e.target.value)}
            />
            <span className="suffix">%</span>
          </div>
        </label>

        <label>
          <span>Expected Annual Rent Increase</span>
          <div className="input-with-suffix">
            <input
              type="number"
              step="0.1"
              value={property.expectedRentIncrease}
              onChange={(e) => update('expectedRentIncrease', e.target.value)}
            />
            <span className="suffix">%</span>
          </div>
        </label>
      </div>
    </div>
  );
};

const ComparisonGrid = ({ rentalTotal, rentalItems, columns, properties, onUpdateProperty }) => {
  const hasData = columns.some((col) => col.calc);
  const colCount = 1 + columns.length;
  const DASH = '\u2014';

  const activeRentalItems = rentalItems.filter(
    (item) => item.label && parseFloat(item.amount) > 0,
  );

  const Row = ({ label, rentalVal, renderCol, sub, bold, muted, rentalClass }) => (
    <>
      <div
        className={`cg-cell cg-label${bold ? ' cg-bold' : ''}${sub ? ' cg-sub' : ''}${muted ? ' cg-muted' : ''}`}
      >
        {label}
      </div>
      <div className={`cg-cell cg-rental${sub ? ' cg-sub' : ''}${rentalClass ? ` ${rentalClass}` : ''}`}>
        {rentalVal}
      </div>
      {columns.map((col, i) => (
        <div key={i} className={`cg-cell cg-property${sub ? ' cg-sub' : ''}`}>
          {renderCol(col, i)}
        </div>
      ))}
    </>
  );

  return (
    <div className="comparison-wrapper">
      <div className="comparison-scroll">
        <div
          className="comparison-grid"
          style={{ gridTemplateColumns: `200px repeat(${colCount}, 1fr)` }}
        >
          {/* Header */}
          <div className="cg-cell cg-header cg-label" />
          <div className="cg-cell cg-header cg-rental">Current Rental</div>
          {columns.map((col, i) => (
            <div key={i} className="cg-cell cg-header cg-property">
              {col.label}
            </div>
          ))}

          {/* Monthly cost */}
          <Row
            bold
            label="Monthly Cost"
            rentalVal={fmt(rentalTotal)}
            renderCol={(col) => (col.calc ? fmt(col.calc.totalMonthlyCost) : DASH)}
          />

          {/* Rental line-item breakdown */}
          {activeRentalItems.map((item, idx) => (
            <Row
              key={`r-${idx}`}
              sub
              label={item.label}
              rentalVal={fmt(item.amount)}
              renderCol={() => DASH}
            />
          ))}

          {/* Property cost breakdown */}
          {hasData && (
            <>
              {/* Mortgage row with inline override input */}
              <div className="cg-cell cg-label cg-sub">Mortgage (P&I)</div>
              <div className="cg-cell cg-rental cg-sub">{DASH}</div>
              {columns.map((col, i) => (
                <div key={i} className="cg-cell cg-property cg-sub">
                  {col.calc ? (
                    <input
                      className="cg-inline-input"
                      type="number"
                      min="0"
                      step="1"
                      placeholder={fmt(col.calc.calculatedMortgage)}
                      value={properties[col.sourceIndex]?.monthlyPaymentOverride || ''}
                      onChange={(e) => {
                        const src = col.sourceIndex;
                        onUpdateProperty(src, {
                          ...properties[src],
                          monthlyPaymentOverride: e.target.value,
                        });
                      }}
                    />
                  ) : DASH}
                </div>
              ))}
              <Row sub label="Property Tax" rentalVal={DASH}
                renderCol={(col) => (col.calc ? fmt(col.calc.monthlyTax) : DASH)} />
              <Row sub label="Insurance" rentalVal={DASH}
                renderCol={(col) => (col.calc ? fmt(col.calc.monthlyInsurance) : DASH)} />
              <Row sub label="HOA" rentalVal={DASH}
                renderCol={(col) => (col.calc ? fmt(col.calc.monthlyHoa) : DASH)} />
              <Row sub label="Maintenance" rentalVal={DASH}
                renderCol={(col) => (col.calc ? fmt(col.calc.monthlyMaintenance) : DASH)} />
            </>
          )}

          <div className="cg-cell cg-separator" style={{ gridColumn: '1 / -1' }} />

          {/* Equity gain */}
          <div className="cg-cell cg-label cg-bold">Monthly Equity Gain</div>
          <div className="cg-cell cg-rental cg-zero">{fmt(0)}</div>
          {columns.map((col, i) => (
            <div
              key={i}
              className={`cg-cell cg-property${col.calc && col.calc.monthlyEquityGain > 0 ? ' cg-positive' : ''}`}
            >
              {col.calc ? fmt(col.calc.monthlyEquityGain) : DASH}
            </div>
          ))}

          {hasData && (
            <>
              <Row sub label="Principal Paydown" rentalVal={DASH}
                renderCol={(col) => (col.calc ? fmt(col.calc.firstMonthPrincipal) : DASH)} />
              <Row sub label="Appreciation" rentalVal={DASH}
                renderCol={(col) => (col.calc ? fmt(col.calc.monthlyAppreciation) : DASH)} />
            </>
          )}

          <div className="cg-cell cg-separator" style={{ gridColumn: '1 / -1' }} />

          {/* Net difference */}
          <div className="cg-cell cg-label cg-bold">Equity vs Rental</div>
          <div className="cg-cell cg-rental">{DASH}</div>
          {columns.map((col, i) => {
            if (!col.calc) return <div key={i} className="cg-cell cg-property">{DASH}</div>;
            const costDiff = col.calc.totalMonthlyCost - rentalTotal;
            const netBenefit = col.calc.monthlyEquityGain - costDiff;
            return (
              <div
                key={i}
                className={`cg-cell cg-property cg-bold ${netBenefit > 0 ? 'cg-positive' : 'cg-negative'}`}
              >
                {netBenefit >= 0 ? '+' : ''}{fmt(netBenefit)}
              </div>
            );
          })}

          <div className="cg-cell cg-label cg-sub cg-muted">Extra cost over rent</div>
          <div className="cg-cell cg-rental cg-sub">{DASH}</div>
          {columns.map((col, i) => {
            if (!col.calc) return <div key={i} className="cg-cell cg-property cg-sub">{DASH}</div>;
            const costDiff = col.calc.totalMonthlyCost - rentalTotal;
            return (
              <div
                key={i}
                className={`cg-cell cg-property cg-sub ${costDiff > 0 ? 'cg-negative' : 'cg-positive'}`}
              >
                {costDiff > 0 ? '+' : ''}{fmt(costDiff)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const EquityPage = () => {
  const authUser = useContext(AuthUserContext);
  const uid = authUser?.user?.uid;

  const [lineItems, setLineItems] = useState(DEFAULT_ITEMS);
  const [properties, setProperties] = useState([]);
  const [scenario, setScenario] = useState(DEFAULT_SCENARIO);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  const loadProfile = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const profile = await getEquityProfile(uid);
      if (profile?.lineItems?.length) setLineItems(profile.lineItems);
      if (profile?.properties?.length) setProperties(profile.properties);
      if (profile?.scenario) setScenario(profile.scenario);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateLineItem = (index, field, value) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addLineItem = () => setLineItems((prev) => [...prev, { label: '', amount: '' }]);
  const removeLineItem = (index) => setLineItems((prev) => prev.filter((_, i) => i !== index));

  const updateProperty = (index, updated) => {
    setProperties((prev) => prev.map((p, i) => (i === index ? updated : p)));
  };

  const addProperty = () => {
    setProperties((prev) => {
      const base = prev.length > 0 ? { ...prev[prev.length - 1], name: '' } : { ...EMPTY_PROPERTY };
      return [...prev, base];
    });
  };

  const removeProperty = (index) => setProperties((prev) => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveEquityProfile(uid, { lineItems, properties, scenario });
      setLastSaved(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!authUser?.auth) {
    return <div className="equity-page">Please sign in to track equity.</div>;
  }

  const rentalTotal = lineItems.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0,
  );

  const columns = buildColumns(properties, scenario);

  return (
    <div className="equity-page">
      <h2>Equity Tracker</h2>

      {loading ? (
        <p>Loading&hellip;</p>
      ) : (
        <>
          {/* ---- Rental ---- */}
          <div className="equity-section">
            <h3>Current Apartment &mdash; Monthly Costs</h3>
            <div className="equity-line-items">
              {lineItems.map((item, i) => (
                <div className="equity-line-item" key={i}>
                  <input
                    type="text"
                    placeholder="Label"
                    value={item.label}
                    onChange={(e) => updateLineItem(i, 'label', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="$ / mo"
                    min="0"
                    step="0.01"
                    value={item.amount}
                    onChange={(e) => updateLineItem(i, 'amount', e.target.value)}
                  />
                  <button className="remove-btn" onClick={() => removeLineItem(i)} title="Remove">
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <button className="add-line-btn" onClick={addLineItem}>
              + Add line item
            </button>
          </div>

          {/* ---- Scenario toggle ---- */}
          <div className="equity-section">
            <h3>Prospect Properties</h3>
            <ScenarioControls scenario={scenario} onChange={setScenario} />

            {properties.map((p, i) => (
              <PropertyForm
                key={i}
                index={i}
                property={p}
                onChange={updateProperty}
                onRemove={removeProperty}
              />
            ))}
            <button className="add-property-btn" onClick={addProperty}>
              + Add Property
            </button>
          </div>

          {/* ---- Save ---- */}
          <div className="equity-actions">
            <button className="save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving\u2026' : 'Save All'}
            </button>
            {error && <span className="equity-error">{error}</span>}
            {lastSaved && (
              <span className="equity-status-msg">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>

          {/* ---- Comparison ---- */}
          <div className="equity-section">
            <h3>Side-by-Side Comparison</h3>
            <ComparisonGrid
              rentalTotal={rentalTotal}
              rentalItems={lineItems}
              columns={columns}
              properties={properties}
              onUpdateProperty={updateProperty}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default EquityPage;
