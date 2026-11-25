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
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailForm, setEmailForm] = useState({
    firstName: '',
    lastName: '',
    workEmail: '',
    mobilePhone: '',
    companyName: '',
    numberOfLocations: '1',
  });
  const [emailFormError, setEmailFormError] = useState('');

  // Update defaults when industry changes
  useEffect(() => {
    const defaults = industryDefaults[industry];
    if (defaults) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

    // PostHog: user clicked Calculate — track inputs (no PII)
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('roi_calculator_completed', {
        industry,
        monthly_call_volume: inputs.monthlyCallVolume,
        missed_call_percentage: inputs.missedCallPercentage,
        avg_appointment_value: inputs.avgAppointmentValue,
        conversion_rate: inputs.conversionRate,
        monthly_lost_revenue: monthlyLostRevenue,
        annual_lost_revenue: annualLostRevenue,
        annual_recovery: annualRecovery,
      });
    }

    if (emailSubmitted) {
      setShowResults(true);
    } else {
      setShowEmailGate(true);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailFormError('');

    const phoneDigits = emailForm.mobilePhone.replace(/\D/g, '');
    if (
      !emailForm.firstName.trim()
      || !emailForm.lastName.trim()
      || !emailForm.workEmail.trim()
      || phoneDigits.length < 10
      || !emailForm.companyName.trim()
    ) {
      setEmailFormError('Please fill in all required fields.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailForm.workEmail)) {
      setEmailFormError('Please enter a valid email address.');
      return;
    }

    // Block free email providers
    const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'mail.com', 'protonmail.com'];
    const emailDomain = emailForm.workEmail.split('@')[1]?.toLowerCase();
    if (freeProviders.includes(emailDomain)) {
      setEmailFormError('Please use your work email address.');
      return;
    }

    const token =
      import.meta.env.PUBLIC_CUTOVER_FORMS_TOKEN || import.meta.env.PUBLIC_FORM_INTAKE_TOKEN || '';
    const submissionData = {
      fields: [
        { name: 'firstname', value: emailForm.firstName },
        { name: 'lastname', value: emailForm.lastName },
        { name: 'email', value: emailForm.workEmail },
        { name: 'mobilephone', value: emailForm.mobilePhone },
        { name: 'company', value: emailForm.companyName },
        { name: 'number_of_locations', value: emailForm.numberOfLocations },
        { name: 'roi_calc_industry', value: industry },
        { name: 'roi_calc_monthly_call_volume', value: String(inputs.monthlyCallVolume) },
        { name: 'roi_calc_missed_call_rate', value: String(inputs.missedCallPercentage) },
        { name: 'roi_calc_avg_appointment_value', value: String(inputs.avgAppointmentValue) },
        { name: 'roi_calc_conversion_rate', value: String(inputs.conversionRate) },
        { name: 'roi_calc_monthly_lost_revenue', value: String(results?.monthlyLostRevenue ?? 0) },
        { name: 'roi_calc_annual_lost_revenue', value: String(results?.annualLostRevenue ?? 0) },
        { name: 'roi_calc_monthly_recovery', value: String(results?.recoveredWithMybcat ?? 0) },
        { name: 'roi_calc_annual_recovery', value: String(results?.annualRecovery ?? 0) },
        { name: 'roi_calc_missed_calls_per_month', value: String(results?.missedCallsPerMonth ?? 0) },
        { name: 'roi_calc_lost_patients_per_month', value: String(results?.lostPatientsPerMonth ?? 0) },
      ],
      context: {
        pageUri: window.location.href,
        pageName: 'ROI Calculator',
        source: 'roi-calculator',
      },
    };

    if (token) {
      try {
        const response = await fetch('https://estate-form-bridge.mybcat-estate.workers.dev', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Forms-Token': token },
          body: JSON.stringify(submissionData),
        });
        if (!response.ok) {
          console.error('Owned intake submission failed:', response.status);
        }
      } catch (err) {
        console.error('Owned intake submission error:', err);
      }
    }

    // PostHog: user submitted email to unlock ROI results (no PII in event properties)
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('roi_calculator_email_submitted', {
        industry,
        number_of_locations: emailForm.numberOfLocations,
        monthly_call_volume: inputs.monthlyCallVolume,
        annual_lost_revenue: results?.annualLostRevenue ?? 0,
        annual_recovery: results?.annualRecovery ?? 0,
      });
    }

    setEmailSubmitted(true);
    setShowEmailGate(false);
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

      {showEmailGate && !emailSubmitted && (
        <div className="email-gate-section">
          <div className="email-gate-header">
            <div className="email-gate-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#006064" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3>Your Results Are Ready!</h3>
            <p>Enter your details below to unlock your personalized ROI report.</p>
          </div>
          <form onSubmit={handleEmailSubmit} className="email-gate-form">
            <div className="gate-form-row">
              <div className="gate-form-field">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  placeholder="Jane"
                  value={emailForm.firstName}
                  onChange={(e) => setEmailForm({ ...emailForm, firstName: e.target.value })}
                />
              </div>
              <div className="gate-form-field">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  placeholder="Chen"
                  value={emailForm.lastName}
                  onChange={(e) => setEmailForm({ ...emailForm, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="gate-form-row">
              <div className="gate-form-field">
                <label htmlFor="workEmail">Work Email *</label>
                <input
                  type="email"
                  id="workEmail"
                  placeholder="jane@yourpractice.com"
                  value={emailForm.workEmail}
                  onChange={(e) => setEmailForm({ ...emailForm, workEmail: e.target.value })}
                />
              </div>
              <div className="gate-form-field">
                <label htmlFor="mobilePhone">Mobile Number *</label>
                <input
                  type="tel"
                  id="mobilePhone"
                  placeholder="(555) 000-0000"
                  value={emailForm.mobilePhone}
                  onChange={(e) => setEmailForm({ ...emailForm, mobilePhone: e.target.value })}
                />
              </div>
            </div>
            <div className="gate-form-row">
              <div className="gate-form-field">
                <label htmlFor="companyName">Company / Practice Name *</label>
                <input
                  type="text"
                  id="companyName"
                  placeholder="Bright Eyes Optometry"
                  value={emailForm.companyName}
                  onChange={(e) => setEmailForm({ ...emailForm, companyName: e.target.value })}
                />
              </div>
              <div className="gate-form-field">
                <label htmlFor="numberOfLocations">Number of Locations</label>
                <select
                  id="numberOfLocations"
                  value={emailForm.numberOfLocations}
                  onChange={(e) => setEmailForm({ ...emailForm, numberOfLocations: e.target.value })}
                >
                  <option value="1">1</option>
                  <option value="2-5">2 - 5</option>
                  <option value="6-10">6 - 10</option>
                  <option value="11-25">11 - 25</option>
                  <option value="26-50">26 - 50</option>
                  <option value="50+">50+</option>
                </select>
              </div>
            </div>
            {emailFormError && <p className="gate-form-error">{emailFormError}</p>}
            <button type="submit" className="gate-submit-btn">
              Unlock My ROI Report
            </button>
            <p className="gate-privacy">
              We use your details to respond to your request. See our <a href="/privacy-policy/">Privacy Policy</a>.
            </p>
          </form>
        </div>
      )}

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

        .email-gate-section {
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid rgba(0, 96, 100, 0.2);
          border-radius: 20px;
          padding: 36px 32px;
          margin-bottom: 32px;
          text-align: center;
        }

        .email-gate-header {
          margin-bottom: 24px;
        }

        .email-gate-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          background: rgba(0, 96, 100, 0.08);
          border-radius: 50%;
          margin-bottom: 12px;
        }

        .email-gate-header h3 {
          font-size: 1.4rem;
          font-weight: 700;
          color: #1a2d3d;
          margin: 0 0 8px 0;
        }

        .email-gate-header p {
          font-size: 15px;
          color: #6c7a88;
          margin: 0;
        }

        .email-gate-form {
          text-align: left;
        }

        .gate-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .gate-form-field label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #1a2d3d;
          margin-bottom: 6px;
        }

        .gate-form-field input,
        .gate-form-field select {
          width: 100%;
          padding: 11px 14px;
          border: 1px solid rgba(0, 0, 0, 0.15);
          border-radius: 10px;
          font-size: 14px;
          background: white;
          color: #1a2d3d;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }

        .gate-form-field input:focus,
        .gate-form-field select:focus {
          outline: none;
          border-color: #006064;
          box-shadow: 0 0 0 3px rgba(0, 96, 100, 0.1);
        }

        .gate-form-field input::placeholder {
          color: #aab4be;
        }

        .gate-form-error {
          color: #b95450;
          font-size: 13px;
          font-weight: 500;
          margin: 0 0 12px 0;
          text-align: center;
        }

        .gate-submit-btn {
          width: 100%;
          padding: 15px 32px;
          background: #006064;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          margin-bottom: 12px;
        }

        .gate-submit-btn:hover {
          background: #004d51;
        }

        .gate-privacy {
          text-align: center;
          font-size: 12px;
          color: #9aa5b0;
          margin: 0;
        }

        @media (max-width: 640px) {
          .results-grid {
            grid-template-columns: 1fr;
          }

          .result-value {
            font-size: 1.5rem;
          }

          .gate-form-row {
            grid-template-columns: 1fr;
          }

          .email-gate-section {
            padding: 24px 20px;
          }
        }
      `}</style>
    </div>
  );
}
