import { useState, useEffect } from 'react';

const specialtyData: Record<string, { ltv: number; conversion: number }> = {
  dental: { ltv: 1200, conversion: 0.65 },
  optometry: { ltv: 800, conversion: 0.70 },
  ophthalmology: { ltv: 1500, conversion: 0.60 },
  veterinary: { ltv: 2000, conversion: 0.55 },
  other: { ltv: 1000, conversion: 0.60 }
};

function formatNumber(num: number): string {
  if (num >= 1000000) return '$' + (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return '$' + (num / 1000).toFixed(0) + 'K';
  return num.toLocaleString();
}

export default function RevenueCalculator() {
  const [locations, setLocations] = useState(4);
  const [specialty, setSpecialty] = useState('dental');
  const [dailyCalls, setDailyCalls] = useState(50);
  const [missedRate, setMissedRate] = useState(30);
  const [newPatientRate, setNewPatientRate] = useState(35);

  const [results, setResults] = useState({
    dailyMissed: 0,
    monthlyOpps: 0,
    annualRevenue: 0,
    fiveYearLoss: 0,
    ebitdaImpact: 0,
    valuation: 0
  });

  useEffect(() => {
    const { ltv, conversion } = specialtyData[specialty];
    const missedRateDecimal = missedRate / 100;
    const newPatientRateDecimal = newPatientRate / 100;

    const dailyMissed = Math.round(locations * dailyCalls * missedRateDecimal);
    const monthlyOpps = Math.round(dailyMissed * newPatientRateDecimal * 22);
    const annualRevenue = Math.round(dailyMissed * newPatientRateDecimal * conversion * ltv * 250);
    const fiveYearLoss = Math.round(annualRevenue * 5.5);
    const ebitdaImpact = Math.round(annualRevenue * 0.25);
    const valuation = Math.round(ebitdaImpact * 8);

    setResults({ dailyMissed, monthlyOpps, annualRevenue, fiveYearLoss, ebitdaImpact, valuation });
  }, [locations, specialty, dailyCalls, missedRate, newPatientRate]);

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ background: '#f8f9fa', borderRadius: '16px', padding: '28px', margin: '24px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '28px' }}>
          {/* Locations */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#27343C', marginBottom: '12px', fontSize: '14px' }}>
              Number of Locations
            </label>
            <select
              value={locations}
              onChange={(e) => setLocations(Number(e.target.value))}
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
              <option value={4}>3-5 locations</option>
              <option value={8}>6-10 locations</option>
              <option value={18}>11-25 locations</option>
              <option value={38}>26-50 locations</option>
              <option value={75}>50+ locations</option>
            </select>
          </div>

          {/* Specialty */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#27343C', marginBottom: '12px', fontSize: '14px' }}>
              Your Specialty
            </label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
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
              <option value="dental">Dental / DSO</option>
              <option value="optometry">Optometry</option>
              <option value="ophthalmology">Ophthalmology</option>
              <option value="veterinary">Veterinary</option>
              <option value="other">Other Healthcare</option>
            </select>
          </div>

          {/* Daily Calls Slider */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#27343C', marginBottom: '12px', fontSize: '14px' }}>
              Avg. Daily Calls Per Location: <span style={{ color: '#006064', fontWeight: 700 }}>{dailyCalls}</span>
            </label>
            <input
              type="range"
              min={20}
              max={100}
              value={dailyCalls}
              onChange={(e) => setDailyCalls(Number(e.target.value))}
              style={{ width: '100%', margin: '12px 0 8px', height: '8px', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888' }}>
              <span>20</span>
              <span>100</span>
            </div>
          </div>

          {/* Missed Rate Slider */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#27343C', marginBottom: '12px', fontSize: '14px' }}>
              Missed Call Rate: <span style={{ color: '#006064', fontWeight: 700 }}>{missedRate}%</span>
            </label>
            <input
              type="range"
              min={10}
              max={50}
              value={missedRate}
              onChange={(e) => setMissedRate(Number(e.target.value))}
              style={{ width: '100%', margin: '12px 0 8px', height: '8px', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888' }}>
              <span>10%</span>
              <span>50%</span>
            </div>
          </div>

          {/* New Patient Rate Slider */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#27343C', marginBottom: '12px', fontSize: '14px' }}>
              New Patient Calls: <span style={{ color: '#006064', fontWeight: 700 }}>{newPatientRate}%</span>
            </label>
            <input
              type="range"
              min={20}
              max={60}
              value={newPatientRate}
              onChange={(e) => setNewPatientRate(Number(e.target.value))}
              style={{ width: '100%', margin: '12px 0 8px', height: '8px', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888' }}>
              <span>20%</span>
              <span>60%</span>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div style={{ background: 'linear-gradient(135deg, #27343C 0%, #1a242b 100%)', borderRadius: '12px', padding: '28px', color: 'white' }}>
          <h3 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 600, color: '#4DD0E1', textAlign: 'center' }}>
            Your Estimated Annual Revenue Loss
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '20px 12px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Daily Missed</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#4DD0E1' }}>{results.dailyMissed.toLocaleString()}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '20px 12px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Monthly Opps Lost</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#4DD0E1' }}>{results.monthlyOpps.toLocaleString()}</div>
            </div>
            <div style={{ background: 'rgba(211,175,94,0.2)', border: '1px solid rgba(211,175,94,0.3)', padding: '20px 12px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Annual Revenue</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#D3AF5E' }}>{formatNumber(results.annualRevenue)}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '20px 12px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>5-Year Loss</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#4DD0E1' }}>{formatNumber(results.fiveYearLoss)}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '20px 12px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>EBITDA Impact</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#4DD0E1' }}>{formatNumber(results.ebitdaImpact)}</div>
            </div>
            <div style={{ background: 'rgba(211,175,94,0.2)', border: '1px solid rgba(211,175,94,0.3)', padding: '20px 12px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Valuation (8x)</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#D3AF5E' }}>{formatNumber(results.valuation)}</div>
            </div>
          </div>
          <p style={{ margin: '20px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
            *Based on Year 1 patient value by specialty and 25% EBITDA flow-through
          </p>
        </div>
      </div>
    </div>
  );
}
