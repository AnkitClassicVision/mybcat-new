import { useState, useEffect } from 'react';

function formatCurrency(num: number): string {
  if (num >= 1000000) return '$' + (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return '$' + (num / 1000).toFixed(0) + 'K';
  return '$' + num.toLocaleString();
}

function formatPercent(num: number): string {
  return num.toFixed(1) + '%';
}

export default function EBITDACalculator() {
  const [revenue, setRevenue] = useState(10000000);
  const [currentMargin, setCurrentMargin] = useState(15);
  const [currentAnswerRate, setCurrentAnswerRate] = useState(70);
  const [targetAnswerRate, setTargetAnswerRate] = useState(95);
  const [newPatientPercent, setNewPatientPercent] = useState(35);
  const [multiple, setMultiple] = useState(5);

  // Ensure target is always >= current + 1
  const effectiveTargetRate = Math.max(targetAnswerRate, currentAnswerRate + 1);

  const [results, setResults] = useState({
    currentEBITDA: 0,
    revenueRecovered: 0,
    ebitdaImprovement: 0,
    newEBITDA: 0,
    newMargin: 0,
    valuationIncrease: 0,
    threeYearImpact: 0,
    monthlyThreshold: 0
  });

  useEffect(() => {
    const currentEBITDA = revenue * (currentMargin / 100);

    // Revenue recovered formula:
    // - Assumes new patient revenue scales with answered call volume
    // - 0.5 conversion factor: ~50% of incremental answered calls convert to patients
    // - Only applies to phone-driven new patient revenue (not online bookings/referrals)
    const rateImprovement = (effectiveTargetRate - currentAnswerRate) / 100;
    const newPatientRevenue = revenue * (newPatientPercent / 100);
    const revenueRecovered = newPatientRevenue * (rateImprovement / (currentAnswerRate / 100)) * 0.5;

    // EBITDA improvement: 25% flow-through rate
    // Conservative estimate - actual flow-through varies by practice capacity and cost structure
    const ebitdaImprovement = revenueRecovered * 0.25;

    const newEBITDA = currentEBITDA + ebitdaImprovement;
    const newMargin = (newEBITDA / (revenue + revenueRecovered)) * 100;

    // Valuation increase
    const valuationIncrease = ebitdaImprovement * multiple;

    // 3-year cumulative with 5% annual compounding growth
    const year1 = ebitdaImprovement;
    const year2 = ebitdaImprovement * 1.05;
    const year3 = ebitdaImprovement * 1.05 * 1.05; // Proper compounding
    const threeYearImpact = year1 + year2 + year3;

    // Monthly investment threshold for 3x ROI
    const monthlyThreshold = (ebitdaImprovement / 12) / 3;

    setResults({
      currentEBITDA: Math.round(currentEBITDA),
      revenueRecovered: Math.round(revenueRecovered),
      ebitdaImprovement: Math.round(ebitdaImprovement),
      newEBITDA: Math.round(newEBITDA),
      newMargin: newMargin,
      valuationIncrease: Math.round(valuationIncrease),
      threeYearImpact: Math.round(threeYearImpact),
      monthlyThreshold: Math.round(monthlyThreshold)
    });
  }, [revenue, currentMargin, currentAnswerRate, effectiveTargetRate, newPatientPercent, multiple]);

  const inputCardStyle = {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  };

  const labelStyle = {
    display: 'block',
    fontWeight: 600,
    color: '#27343C',
    marginBottom: '12px',
    fontSize: '14px'
  };

  const sliderStyle = {
    width: '100%',
    margin: '12px 0 8px',
    height: '8px',
    cursor: 'pointer'
  };

  const rangeLabelsStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#888'
  };

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <style>{`
        .ebitda-calc-slider {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background: rgba(0, 96, 100, 0.15);
          border-radius: 4px;
          outline: none;
          touch-action: manipulation;
        }
        .ebitda-calc-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 44px;
          height: 44px;
          background: #006064;
          border-radius: 50%;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        .ebitda-calc-slider::-moz-range-thumb {
          width: 44px;
          height: 44px;
          background: #006064;
          border-radius: 50%;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        .ebitda-calc-slider::-moz-range-track {
          height: 8px;
          background: rgba(0, 96, 100, 0.15);
          border-radius: 4px;
        }
      `}</style>
      <div style={{ background: '#f8f9fa', borderRadius: '16px', padding: '28px', margin: '24px 0' }}>

        {/* Input Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '28px' }}>

          {/* Annual Revenue */}
          <div style={{ ...inputCardStyle, gridColumn: 'span 2' }}>
            <label htmlFor="ebitda-revenue" style={labelStyle}>
              Current Annual Revenue: <span style={{ color: '#006064', fontWeight: 700 }}>{formatCurrency(revenue)}</span>
            </label>
            <input
              id="ebitda-revenue"
              type="range"
              min={500000}
              max={50000000}
              step={500000}
              value={revenue}
              onChange={(e) => setRevenue(Number(e.target.value))}
              className="ebitda-calc-slider"
              style={sliderStyle}
              aria-label="Current Annual Revenue"
            />
            <div style={rangeLabelsStyle}>
              <span>$500K</span>
              <span>$50M</span>
            </div>
          </div>

          {/* Current EBITDA Margin */}
          <div style={inputCardStyle}>
            <label htmlFor="ebitda-margin" style={labelStyle}>
              Current EBITDA Margin: <span style={{ color: '#006064', fontWeight: 700 }}>{currentMargin}%</span>
            </label>
            <input
              id="ebitda-margin"
              type="range"
              min={5}
              max={30}
              value={currentMargin}
              onChange={(e) => setCurrentMargin(Number(e.target.value))}
              className="ebitda-calc-slider"
              style={sliderStyle}
              aria-label="Current EBITDA Margin"
            />
            <div style={rangeLabelsStyle}>
              <span>5%</span>
              <span>30%</span>
            </div>
          </div>

          {/* Current Answer Rate */}
          <div style={inputCardStyle}>
            <label htmlFor="ebitda-current-answer" style={labelStyle}>
              Current Call Answer Rate: <span style={{ color: '#dc3545', fontWeight: 700 }}>{currentAnswerRate}%</span>
            </label>
            <input
              id="ebitda-current-answer"
              type="range"
              min={50}
              max={90}
              value={currentAnswerRate}
              onChange={(e) => setCurrentAnswerRate(Number(e.target.value))}
              className="ebitda-calc-slider"
              style={sliderStyle}
              aria-label="Current Call Answer Rate"
            />
            <div style={rangeLabelsStyle}>
              <span>50%</span>
              <span>90%</span>
            </div>
          </div>

          {/* Target Answer Rate */}
          <div style={inputCardStyle}>
            <label htmlFor="ebitda-target-answer" style={labelStyle}>
              Target Answer Rate: <span style={{ color: '#28a745', fontWeight: 700 }}>{targetAnswerRate}%</span>
            </label>
            <input
              id="ebitda-target-answer"
              type="range"
              min={85}
              max={99}
              value={targetAnswerRate}
              onChange={(e) => setTargetAnswerRate(Number(e.target.value))}
              className="ebitda-calc-slider"
              style={sliderStyle}
              aria-label="Target Answer Rate"
            />
            <div style={rangeLabelsStyle}>
              <span>85%</span>
              <span>99%</span>
            </div>
          </div>

          {/* New Patient Revenue % */}
          <div style={inputCardStyle}>
            <label htmlFor="ebitda-new-patient" style={labelStyle}>
              New Patient % of Revenue: <span style={{ color: '#006064', fontWeight: 700 }}>{newPatientPercent}%</span>
            </label>
            <input
              id="ebitda-new-patient"
              type="range"
              min={20}
              max={50}
              value={newPatientPercent}
              onChange={(e) => setNewPatientPercent(Number(e.target.value))}
              className="ebitda-calc-slider"
              style={sliderStyle}
              aria-label="New Patient Percentage of Revenue"
            />
            <div style={rangeLabelsStyle}>
              <span>20%</span>
              <span>50%</span>
            </div>
          </div>

          {/* Valuation Multiple */}
          <div style={inputCardStyle}>
            <label htmlFor="ebitda-multiple" style={labelStyle}>
              Expected Valuation Multiple
            </label>
            <select
              id="ebitda-multiple"
              value={multiple}
              onChange={(e) => setMultiple(Number(e.target.value))}
              aria-label="Expected Valuation Multiple"
              style={{
                width: '100%',
                padding: '14px 40px 14px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
                color: '#27343C',
                backgroundColor: 'white',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 16px center'
              }}
            >
              <option value={3}>3x EBITDA</option>
              <option value={4}>4x EBITDA</option>
              <option value={5}>5x EBITDA (typical)</option>
              <option value={6}>6x EBITDA</option>
              <option value={7}>7x EBITDA (premium)</option>
              <option value={8}>8x EBITDA</option>
            </select>
          </div>
        </div>

        {/* Results Section */}
        <div style={{ background: 'linear-gradient(135deg, #27343C 0%, #1a242b 100%)', borderRadius: '12px', padding: '28px', color: 'white' }}>
          <h3 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 600, color: '#4DD0E1', textAlign: 'center' }}>
            Your Intake Optimization Impact
          </h3>

          {/* Current vs Optimized */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Current EBITDA</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#999' }}>{formatCurrency(results.currentEBITDA)}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{currentMargin}% margin</div>
            </div>
            <div style={{ background: 'rgba(77,208,225,0.15)', border: '1px solid rgba(77,208,225,0.3)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Optimized EBITDA</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#4DD0E1' }}>{formatCurrency(results.newEBITDA)}</div>
              <div style={{ fontSize: '13px', color: '#4DD0E1', marginTop: '4px' }}>{formatPercent(results.newMargin)} margin</div>
            </div>
          </div>

          {/* Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '16px 12px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Revenue Recovered</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#4DD0E1' }}>{formatCurrency(results.revenueRecovered)}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '16px 12px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>EBITDA Improvement</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#4DD0E1' }}>+{formatCurrency(results.ebitdaImprovement)}</div>
            </div>
            <div style={{ background: 'rgba(211,175,94,0.2)', border: '1px solid rgba(211,175,94,0.3)', padding: '16px 12px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Valuation Increase</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#D3AF5E' }}>+{formatCurrency(results.valuationIncrease)}</div>
            </div>
          </div>

          {/* Bottom Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '16px 12px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>3-Year Cumulative EBITDA</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#4DD0E1' }}>{formatCurrency(results.threeYearImpact)}</div>
            </div>
            <div style={{ background: 'rgba(40,167,69,0.2)', border: '1px solid rgba(40,167,69,0.3)', padding: '16px 12px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Monthly Investment Threshold*</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#28a745' }}>{formatCurrency(results.monthlyThreshold)}</div>
            </div>
          </div>

          <p style={{ margin: '20px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: '1.5' }}>
            *Max monthly spend for 3x ROI | Assumptions: 25% EBITDA flow-through, 50% call-to-patient conversion, phone-driven new patient revenue only.<br/>
            Actual results vary by practice capacity, payer mix, and cost structure. For precise analysis, use your actual call data.
          </p>
        </div>
      </div>
    </div>
  );
}
