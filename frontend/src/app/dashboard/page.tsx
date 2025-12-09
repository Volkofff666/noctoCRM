'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { dashboardApi, type User, type DashboardStats, type Activity } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [pipelineStats, setPipelineStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    loadDashboard();
  }, [router]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsData, activitiesData, pipelineData] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRecentActivities(10),
        dashboardApi.getPipelineStats(),
      ]);
      setStats(statsData);
      setActivities(activitiesData);
      setPipelineStats(pipelineData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex">
        <Sidebar user={user} />
        <div className="flex-1" style={{ marginLeft: '240px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="text-lg" style={{ color: 'var(--text-secondary)' }}>Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar user={user} />
      
      <div className="flex-1" style={{ marginLeft: '240px', background: 'var(--bg-secondary)', minHeight: '100vh' }}>
        <header className="header">
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Dashboard
            </h2>
          </div>
        </header>

        <div className="px-6 py-6">
          {/* Основные метрики */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Link href="/deals" className="card" style={{ textDecoration: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
              <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Сделки</p>
              <p className="text-3xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {stats.deals.total}
              </p>
              <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                <span style={{ color: 'var(--success)' }}>✓ {stats.deals.won}</span>
                <span style={{ color: 'var(--accent)' }}>• {stats.deals.open}</span>
                <span style={{ color: 'var(--danger)' }}>✕ {stats.deals.lost}</span>
              </div>
            </Link>

            <Link href="/clients" className="card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
              <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Клиенты</p>
              <p className="text-3xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {stats.clients.total}
              </p>
              <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                <span style={{ color: 'var(--warning)' }}>Лиды: {stats.clients.leads}</span>
                <span style={{ color: 'var(--success)' }}>Клиенты: {stats.clients.clients}</span>
              </div>
            </Link>

            <Link href="/tasks" className="card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
              <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Задачи</p>
              <p className="text-3xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {stats.tasks.total}
              </p>
              <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                <span style={{ color: 'var(--warning)' }}>Активные: {stats.tasks.pending}</span>
                <span style={{ color: 'var(--success)' }}>Готово: {stats.tasks.completed}</span>
              </div>
            </Link>

            <div className="card" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #0B5ED7 100%)', color: 'white', border: 'none' }}>
              <p className="text-sm mb-2" style={{ opacity: 0.9 }}>Выручка за месяц</p>
              <p className="text-3xl font-semibold mb-2">
                {stats.revenue.month.toLocaleString('ru-RU')} ₽
              </p>
              <div style={{ fontSize: '13px', opacity: 0.9 }}>
                Всего: {stats.revenue.total.toLocaleString('ru-RU')} ₽
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Воронка */}
            <div className="card col-span-2">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Воронка продаж (конверсия {stats.conversion_rate}%)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pipelineStats.map((stage) => (
                  <div key={stage.stage_id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {stage.stage_name}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {stage.count} сд. • {stage.amount.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${(stage.count / (stats.deals.total || 1)) * 100}%`,
                          background: stage.color,
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Последние активности */}
            <div className="card">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Последние активности
              </h3>
              {activities.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Пока нет активностей
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      style={{
                        padding: '10px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '6px',
                        borderLeft: '3px solid var(--accent)',
                      }}
                    >
                      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        {activity.subject}
                      </p>
                      {activity.content && (
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {activity.content}
                        </p>
                      )}
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {new Date(activity.created_at).toLocaleString('ru-RU')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
