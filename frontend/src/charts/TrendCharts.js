import React from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function ActivityTrendChart({ history }) {
  const labels = history.map((h) => new Date(h.createdAt).toLocaleDateString()).reverse();
  const data = {
    labels,
    datasets: [
      { label: 'Walking %', data: history.map((h) => h.walking_pct).reverse(), borderColor: '#22c55e' },
      { label: 'Running %', data: history.map((h) => h.running_pct).reverse(), borderColor: '#3b82f6' },
      { label: 'Stationary %', data: history.map((h) => h.stationary_pct).reverse(), borderColor: '#94a3b8' },
    ],
  };
  return <Line data={data} options={{ responsive: true }} />;
}

export function SleepTrendChart({ history }) {
  const labels = history.map((h) => new Date(h.createdAt).toLocaleDateString()).reverse();
  return (
    <Line
      data={{
        labels,
        datasets: [{ label: 'Sleep Score', data: history.map((h) => h.sleep_score).reverse(), borderColor: '#8b5cf6' }],
      }}
    />
  );
}

export function StressTrendChart({ history }) {
  const labels = history.map((h) => new Date(h.createdAt).toLocaleDateString()).reverse();
  return (
    <Line
      data={{
        labels,
        datasets: [{ label: 'Stress Score', data: history.map((h) => h.stress_score).reverse(), borderColor: '#ef4444' }],
      }}
    />
  );
}

export function PredictionHistoryChart({ history }) {
  const map = { 'Low Risk': 0, 'Moderate Risk': 1, 'High Risk': 2 };
  const labels = history.map((h) => new Date(h.createdAt).toLocaleDateString()).reverse();
  return (
    <Line
      data={{
        labels,
        datasets: [{
          label: 'Risk Level',
          data: history.map((h) => map[h.prediction] ?? 0).reverse(),
          borderColor: '#4f46e5',
        }],
      }}
      options={{ scales: { y: { ticks: { callback: (v) => ['Low', 'Mod', 'High'][v] || v } } } }}
    />
  );
}

export function RiskPieChart({ history }) {
  const counts = {};
  history.forEach((h) => { counts[h.prediction] = (counts[h.prediction] || 0) + 1; });
  const labels = Object.keys(counts);
  return (
    <Pie
      data={{
        labels,
        datasets: [{
          data: Object.values(counts),
          backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
        }],
      }}
    />
  );
}
