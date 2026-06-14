import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { deleteAdminUser, exportCsv, getAdminStats, getAdminUsers } from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);

  const load = () => {
    getAdminStats().then((r) => setStats(r.data));
    getAdminUsers().then((r) => setUsers(r.data.users || []));
  };

  useEffect(() => { load(); }, []);

  const handleExport = async () => {
    const res = await exportCsv();
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assessments_export.csv';
    a.click();
  };

  if (!stats) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;

  const pieData = {
    labels: Object.keys(stats.riskDistribution || {}),
    datasets: [{
      data: Object.values(stats.riskDistribution || {}),
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6366f1'],
      borderWidth: 0,
    }],
  };

  return (
    <div className="fade-in">
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h1>Admin Panel</h1>
          <p className="text-muted mb-0">System overview & user management</p>
        </div>
        <button className="btn btn-mw-primary" onClick={handleExport}>
          <i className="bi bi-download me-1" />Export CSV
        </button>
      </div>

      <div className="row g-3 mb-4">
        {[
          ['Total Users', stats.totalUsers, 'bi-people-fill', 'purple'],
          ['Assessments', stats.totalAssessments, 'bi-clipboard-data', 'cyan'],
          ['Avg Confidence', `${stats.averageConfidence}%`, 'bi-cpu', 'green'],
        ].map(([label, val, icon, color]) => (
          <div className="col-md-4" key={label}>
            <div className="stat-card">
              <div className={`stat-icon ${color}`}><i className={`bi ${icon}`} /></div>
              <div className="stat-label">{label}</div>
              <div className="stat-value">{val}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card-mw p-4">
            <h5><i className="bi bi-pie-chart text-primary me-2" />Risk Distribution</h5>
            <Pie data={pieData} options={{ plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>
        <div className="col-lg-7">
          <div className="card-mw p-4">
            <h5 className="mb-3"><i className="bi bi-person-gear text-primary me-2" />User Management</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead><tr><th>Name</th><th>Email</th><th></th></tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.uid}>
                      <td className="fw-semibold">{u.name}</td>
                      <td className="text-muted">{u.email}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => { if (window.confirm('Delete user?')) deleteAdminUser(u.uid).then(load); }}>
                          <i className="bi bi-trash" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
