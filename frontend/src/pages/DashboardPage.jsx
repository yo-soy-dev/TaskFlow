import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { taskAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = { todo: '#64748b', 'in-progress': '#3b82f6', review: '#f59e0b', completed: '#10b981' };
const PRIORITY_COLORS = { low: '#10b981', medium: '#3b82f6', high: '#f59e0b', critical: '#ef4444' };

const StatCard = ({ icon, label, value, color, onClick }) => (
  <div className="stat-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
    <div className="stat-card-icon" style={{ background: `${color}20`, fontSize: 20 }}>{icon}</div>
    <div className="stat-card-value" style={{ color }}>{value}</div>
    <div className="stat-card-label">{label}</div>
  </div>
);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
        <strong style={{ textTransform: 'capitalize' }}>{payload[0].name}</strong>: {payload[0].value}
      </div>
    );
  }
  return null;
};

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    taskAPI.getStats()
      .then(({ data }) => setStats(data.data.stats))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-full"><div className="loading-spinner" /></div>;

  const statusData = stats ? Object.entries(stats.byStatus).map(([name, value]) => ({ name, value })) : [];
  const priorityData = stats ? Object.entries(stats.byPriority).map(([name, value]) => ({ name, value })) : [];
  const completionRate = stats?.total > 0 ? Math.round((stats.byStatus.completed / stats.total) * 100) : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        {/* <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
          Good {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1> */}
        <h1 style={{
          fontSize: 'clamp(18px, 4vw, 24px)',
          fontWeight: 700,
          marginBottom: 4
        }}>
          Good {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {isAdmin ? "Here's an overview of all tasks in the system." : "Here's a summary of your tasks."}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid" style={{ marginBottom: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <StatCard icon="📋" label="Total Tasks" value={stats?.total || 0} color="var(--accent-light)" onClick={() => navigate('/tasks')} />
        <StatCard icon="⏳" label="In Progress" value={stats?.byStatus['in-progress'] || 0} color="var(--info)" />
        <StatCard icon="✅" label="Completed" value={stats?.byStatus.completed || 0} color="var(--success)" />
        <StatCard icon="🔴" label="Overdue" value={stats?.overdue || 0} color="var(--danger)" />
        <StatCard icon="📊" label="Completion Rate" value={`${completionRate}%`} color="var(--warning)" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 20, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Tasks by Status</h3>
          </div>
          {stats?.total > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {statusData.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize', fontSize: 12 }}>{v.replace('-', ' ')}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><div className="empty-state-icon">📊</div><div className="empty-state-text">No task data yet</div></div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Tasks by Priority</h3>
          </div>
          {stats?.total > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={priorityData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry) => <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><div className="empty-state-icon">📊</div><div className="empty-state-text">No priority data yet</div></div>
          )}
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Status Breakdown</h3>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/tasks')}>View All Tasks →</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {[
            { label: 'Todo', key: 'todo', color: 'var(--text-muted)', icon: '○' },
            { label: 'In Progress', key: 'in-progress', color: 'var(--info)', icon: '◉' },
            { label: 'In Review', key: 'review', color: 'var(--warning)', icon: '◎' },
            { label: 'Completed', key: 'completed', color: 'var(--success)', icon: '●' },
          ].map(({ label, key, color, icon }) => (
            <div key={key} style={{ background: 'var(--bg-hover)', borderRadius: 'var(--radius)', padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 24, color, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color }}>{stats?.byStatus[key] || 0}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;