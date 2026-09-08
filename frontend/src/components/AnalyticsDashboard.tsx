interface AnalyticsData {
  totalSessions: number;
  sessionConversionRate: number;
  actionsPerSession: number;
  timeToFirstAction: number;
  finalStepConversion: number;
  sessionsPerUser: number;
}

interface ComparisonData {
  control: {
    timeToFirstAction: number;
    actionsPerSession: number;
    conversionRate: number;
  };
  intelligent: {
    timeToFirstAction: number;
    actionsPerSession: number;
    conversionRate: number;
  };
}

interface AnalyticsDashboardProps {
  data: { data: AnalyticsData; comparison: ComparisonData } | null;
}

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const d = data?.data || {
    totalSessions: 128,
    sessionConversionRate: 0.187,
    actionsPerSession: 2.4,
    timeToFirstAction: 18,
    finalStepConversion: 0.64,
    sessionsPerUser: 3.2
  };

  const comparison = data?.comparison || {
    control: { timeToFirstAction: 31, actionsPerSession: 1.5, conversionRate: 0.124 },
    intelligent: { timeToFirstAction: 18, actionsPerSession: 2.4, conversionRate: 0.187 }
  };

  const metrics = [
    ['Total sessions', d.totalSessions],
    ['Conversion rate', `${(d.sessionConversionRate * 100).toFixed(1)}%`],
    ['Actions / session', d.actionsPerSession.toFixed(1)],
    ['Time to first action', `${Math.round(d.timeToFirstAction)} sec`],
    ['Final-step conversion', `${(d.finalStepConversion * 100).toFixed(0)}%`],
    ['Sessions / user', d.sessionsPerUser.toFixed(1)]
  ];

  return (
    <main className="content">
      <span className="eyebrow">Measure what matters</span>
      <h1 className="heading">
        Session quality,
        <br />
        made visible.
      </h1>
      <p className="subheading">
        These indicators help us improve relevance and convenience without treating more activity
        as the goal.
      </p>
      <div className="analytics-grid">
        {metrics.map(([label, value]) => (
          <div className="metric" key={String(label)}>
            <span>{label}</span>
            <strong>{value}</strong>
            <em>↗ demo indicator</em>
          </div>
        ))}
      </div>
      <div className="panel">
        <span className="notice">CONTROL VS SESSION INTELLIGENCE · SIMULATED DEMO VALUES</span>
        <h2 style={{ marginTop: 17 }}>A more relevant session should feel faster, not louder.</h2>
        <p>
          Illustrative comparison for the hackathon narrative. These are not production results or
          an experiment.
        </p>
        <div className="compare">
          <Compare
            title="Control"
            values={['31 sec', '1.5', '12.4%']}
            bars={[62, 38, 42]}
          />
          <Compare
            title="Session Intelligence"
            values={['18 sec', '2.4', '18.7%']}
            bars={[36, 60, 63]}
            featured
          />
        </div>
      </div>
      <div className="panel">
        <h2>What the engine understood</h2>
        <p>Signals are structured, inspectable inputs—not a black-box profile.</p>
        <div className="reasons">
          <span className="reason">football_search</span>
          <span className="reason">multiple_football_views</span>
          <span className="reason">time_preference</span>
          <span className="reason">user-controlled action</span>
        </div>
      </div>
    </main>
  );
}

function Compare({
  title,
  values,
  bars,
  featured = false
}: {
  title: string;
  values: string[];
  bars: number[];
  featured?: boolean;
}) {
  return (
    <div className={`compare-col ${featured ? 'featured' : ''}`}>
      <h3>{title}</h3>
      {['Time to first action', 'Actions / session', 'Conversion rate'].map((label, i) => (
        <div className="bar-row" key={label}>
          <span>{label}</span>
          <div className="bar">
            <div className="fill" style={{ width: `${bars[i]}%` }} />
          </div>
          <b>{values[i]}</b>
        </div>
      ))}
    </div>
  );
}
