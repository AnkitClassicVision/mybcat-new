import { useState, useEffect } from 'react';

interface CalculatorInputs {
  monthlyCallVolume: number;
  missedCallPercentage: number;
  avgAppointmentValue: number;
  conversionRate: number;
}

interface CalculatorResults {
  missedCallsPerMonth: number;
  lostPatientsPerMonth: number;
  monthlyLostRevenue: number;
  annualLostRevenue: number;
  recoveredWithMybcat: number;
  annualRecovery: number;
}

const industryDefaults: Record<string, Partial<CalculatorInputs>> = {
  optometry: {
    avgAppointmentValue: 350,
    missedCallPercentage: 29,
  },
  dental: {
    avgAppointmentValue: 450,
    missedCallPercentage: 25,
  },
  veterinary: {
    avgAppointmentValue: 280,
    missedCallPercentage: 30,
  },
  medspa: {
    avgAppointmentValue: 650,
    missedCallPercentage: 28,
  },
  dermatology: {
    avgAppointmentValue: 400,
    missedCallPercentage: 26,
  },
  'urgent-care': {
    avgAppointmentValue: 250,
    missedCallPercentage: 22,
  },
  general: {
    avgAppointmentValue: 350,
    missedCallPercentage: 27,
  },
};

export default function ROICalculator() {
  const [industry, setIndustry] = useState('general');
  const [inputs, setInputs] = useState<CalculatorInputs>({
    monthlyCallVolume: 500,
    missedCallPercentage: 27,
    avgAppointmentValue: 350,
    conversionRate: 60,
  });
  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Update defaults when industry changes
  useEffect(() => {
    const defaults = industryDefaults[industry];
    if (defaults) {
      setInputs(prev => ({
        ...prev,
        ...defaults,
      }));
    }
  }, [industry]);

  // Calculate results
  const calculateROI = () => {
    const missedCallsPerMonth = Math.round(
      (inputs.monthlyCallVolume * inputs.missedCallPercentage) / 100
    );
    const lostPatientsPerMonth = Math.round(
      (missedCallsPerMonth * inputs.conversionRate) / 100
    );
    const monthlyLostRevenue = lostPatientsPerMonth * inputs.avgAppointmentValue;
    const annualLostRevenue = monthlyLostRevenue * 12;

    // mybcat recovery assumptions: 95% call answer rate, slight conversion improvement
    const recoveredCalls = Math.round(missedCallsPerMonth * 0.95);
    const recoveredPatients = Math.round((recoveredCalls * (inputs.conversionRate + 5)) / 100);
    const recoveredWithMybcat = recoveredPatients * inputs.avgAppointmentValue;
    const annualRecovery = recoveredWithMybcat * 12;

    setResults({
      missedCallsPerMonth,
      lostPatientsPerMonth,
      monthlyLostRevenue,
      annualLostRevenue,
      recoveredWithMybcat,
      annualRecovery,
    });
    setShowResults(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="roi-calculator">
      <div className="calculator-form">
        <div className="form-section">
          <label htmlFor="industry">Select Your Industry</label>
          <select
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            <option value="general">General Practice</option>
            <option value="optometry">Optometry</option>
            <option value="dental">Dental</option>
            <option value="veterinary">Veterinary</option>
            <option value="medspa">MedSpa</option>
            <option value="dermatology">Dermatology</option>
            <option value="urgent-care">Urgent Care</option>
          </select>
        </div>

        <div className="form-section">
          <label htmlFor="callVolume">Monthly Call Volume</label>
          <div className="input-with-slider">
            <input
              type="range"
              id="callVolume"
              min="100"
              max="2000"
              step="50"
              value={inputs.monthlyCallVolume}
              onChange={(e) =>
                setInputs({ ...inputs, monthlyCallVolume: Number(e.target.value) })
              }
            />
            <span className="value-display">{inputs.monthlyCallVolume} calls</span>
          </div>
        </div>

        <div className="form-section">
          <label htmlFor="missedRate">
            Missed Call Rate (%)
            <span className="hint">Industry average: {industryDefaults[industry]?.missedCallPercentage}%</span>
          </label>
          <div className="input-with-slider">
            <input
              type="range"
              id="missedRate"
              min="5"
              max="50"
              step="1"
              value={inputs.missedCallPercentage}
              onChange={(e) =>
                setInputs({ ...inputs, missedCallPercentage: Number(e.target.value) })
              }
            />
            <span className="value-display">{inputs.missedCallPercentage}%</span>
          </div>
        </div>

        <div className="form-section">
          <label htmlFor="appointmentValue">
            Average Appointment Value ($)
          </label>
          <div className="input-with-slider">
            <input
              type="range"
              id="appointmentValue"
              min="100"
              max="1500"
              step="25"
              value={inputs.avgAppointmentValue}
              onChange={(e) =>
                setInputs({ ...inputs, avgAppointmentValue: Number(e.target.value) })
              }
            />
            <span className="value-display">{formatCurrency(inputs.avgAppointmentValue)}</span>
          </div>
        </div>

        <div className="form-section">
          <label htmlFor="conversionRate">
            Call-to-Appointment Conversion Rate (%)
          </label>
          <div className="input-with-slider">
            <input
              type="range"
              id="conversionRate"
              min="20"
              max="80"
              step="5"
              value={inputs.conversionRate}
              onChange={(e) =>
                setInputs({ ...inputs, conversionRate: Number(e.target.value) })
              }
            />
            <span className="value-display">{inputs.conversionRate}%</span>
          </div>
        </div>

        <button className="calculate-btn" onClick={calculateROI}>
          Calculate My Potential ROI
        </button>
      </div>

      {showResults && results && (
        <div className="results-section">
          <h3>Your Potential Revenue Impact</h3>

          <div className="results-grid">
            <div className="result-card problem">
              <span className="result-label">Current Lost Revenue</span>
              <span className="result-value negative">
                {formatCurrency(results.monthlyLostRevenue)}/mo
              </span>
              <span className="result-sublabel">
                {formatCurrency(results.annualLostRevenue)} annually
              </span>
            </div>

            <div className="result-card solution">
              <span className="result-label">Potential Recovery with mybcat</span>
              <span className="result-value positive">
                {formatCurrency(results.recoveredWithMybcat)}/mo
              </span>
              <span className="result-sublabel">
                {formatCurrency(results.annualRecovery)} annually
              </span>
            </div>
          </div>

          <div className="breakdown">
            <h4>How We Calculated This</h4>
            <ul>
              <li>
                <span>Missed calls per month:</span>
                <strong>{results.missedCallsPerMonth} calls</strong>
              </li>
              <li>
                <span>Lost patient opportunities:</span>
                <strong>{results.lostPatientsPerMonth} patients</strong>
              </li>
              <li>
                <span>Monthly revenue loss:</span>
                <strong>{formatCurrency(results.monthlyLostRevenue)}</strong>
              </li>
            </ul>
          </div>

          <div className="cta-section">
            <p>
              Ready to recover this revenue? Talk to our team about how mybcat can help.
            </p>
            <a href="/contact/" className="cta-button">
              Get a Custom Analysis
            </a>
          </div>
        </div>
      )}

      <style>{`
        .roi-calculator {
          font-family: var(--font-sans, system-ui, sans-serif);
        }

        .calculator-form {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 32px;
        }

        .form-section {
          margin-bottom: 24px;
        }

        .form-section label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #1a2d3d;
          margin-bottom: 8px;
        }

        .form-section .hint {
          font-weight: 400;
          color: #6c7a88;
          margin-left: 8px;
          font-size: 12px;
        }

        select {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 10px;
          font-size: 15px;
          background: white;
          cursor: pointer;
        }

        .input-with-slider {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        input[type="range"] {
          flex: 1;
          height: 8px;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background: rgba(0, 96, 100, 0.1);
          border-radius: 4px;
          outline: none;
          touch-action: manipulation;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 44px;
          height: 44px;
          background: #006064;
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.2s;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        input[type="range"]::-moz-range-thumb {
          width: 44px;
          height: 44px;
          background: #006064;
          border-radius: 50%;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }

        input[type="range"]::-moz-range-track {
          height: 8px;
          background: rgba(0, 96, 100, 0.1);
          border-radius: 4px;
        }

        .value-display {
          min-width: 100px;
          text-align: right;
          font-weight: 600;
          color: #1a2d3d;
          font-size: 15px;
        }

        .calculate-btn {
          width: 100%;
          padding: 16px 32px;
          background: #006064;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .calculate-btn:hover {
          background: #004d51;
        }

        .results-section {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 20px;
          padding: 32px;
        }

        .results-section h3 {
          text-align: center;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a2d3d;
          margin-bottom: 24px;
        }

        .results-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 32px;
        }

        .result-card {
          padding: 24px;
          border-radius: 16px;
          text-align: center;
        }

        .result-card.problem {
          background: rgba(185, 84, 80, 0.08);
          border: 1px solid rgba(185, 84, 80, 0.2);
        }

        .result-card.solution {
          background: rgba(0, 96, 100, 0.08);
          border: 1px solid rgba(0, 96, 100, 0.2);
        }

        .result-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        .problem .result-label { color: #b95450; }
        .solution .result-label { color: #006064; }

        .result-value {
          display: block;
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .result-value.negative { color: #b95450; }
        .result-value.positive { color: #006064; }

        .result-sublabel {
          font-size: 14px;
          color: #6c7a88;
        }

        .breakdown {
          background: rgba(0, 0, 0, 0.03);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .breakdown h4 {
          font-size: 14px;
          font-weight: 600;
          color: #1a2d3d;
          margin-bottom: 12px;
        }

        .breakdown ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .breakdown li {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .breakdown li:last-child {
          border-bottom: none;
        }

        .breakdown li span {
          color: #6c7a88;
        }

        .breakdown li strong {
          color: #1a2d3d;
        }

        .cta-section {
          text-align: center;
          padding-top: 16px;
        }

        .cta-section p {
          font-size: 15px;
          color: #6c7a88;
          margin-bottom: 16px;
        }

        .cta-button {
          display: inline-block;
          padding: 14px 28px;
          background: #006064;
          color: white;
          text-decoration: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 15px;
          transition: background 0.2s;
        }

        .cta-button:hover {
          background: #004d51;
        }

        @media (max-width: 640px) {
          .results-grid {
            grid-template-columns: 1fr;
          }

          .result-value {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
