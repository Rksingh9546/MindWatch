import React, { useEffect, useState } from 'react';
import { getHistory } from '../services/api';
import {
  ActivityTrendChart,
  PredictionHistoryChart,
  RiskPieChart,
  SleepTrendChart,
  StressTrendChart,
} from '../charts/TrendCharts';

const charts = [
  { title: 'Activity Trends', icon: 'bi-person-walking', Component: ActivityTrendChart },
  { title: 'Sleep Patterns', icon: 'bi-moon-stars', Component: SleepTrendChart },
  { title: 'Stress Levels', icon: 'bi-lightning', Component: StressTrendChart },
  { title: 'Risk History', icon: 'bi-graph-up', Component: PredictionHistoryChart },
  { title: 'Risk Distribution', icon: 'bi-pie-chart', Component: RiskPieChart },
];

export default function Analytics() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getHistory().then((r) => setHistory(r.data.history || []));
  }, []);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Analytics Dashboard</h1>
        <p className="text-muted">Visualize your mental health trends over time</p>
      </div>

      {!history.length ? (
        <div className="card-mw p-5 text-center">
          <i className="bi bi-bar-chart-line display-1 text-primary opacity-25" />
          <h5 className="mt-3">No data yet</h5>
          <p className="text-muted">Complete assessments to unlock interactive charts</p>
        </div>
      ) : (
        <div className="row g-4">
          {charts.map(({ title, icon, Component }) => (
            <div className="col-lg-6" key={title}>
              <div className="card-mw p-4 h-100">
                <h6 className="mb-3"><i className={`bi ${icon} text-primary me-2`} />{title}</h6>
                <Component history={history} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
