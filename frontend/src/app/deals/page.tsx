'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { dealsApi, pipelinesApi, type User, type Deal, type Pipeline } from '@/lib/api';

export default function DealsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pipelineFilter, setPipelineFilter] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    loadPipelines();
    loadDeals();
  }, [router]);

  const loadPipelines = async () => {
    try {
      const data = await pipelinesApi.list();
      setPipelines(data);
    } catch (error) {
      console.error('Error loading pipelines:', error);
    }
  };

  const loadDeals = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      if (pipelineFilter) filters.pipeline_id = Number(pipelineFilter);
      
      const data = await dealsApi.list(filters);
      
      if (searchQuery) {
        const filtered = data.filter(deal => 
          deal.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setDeals(filtered);
      } else {
        setDeals(data);
      }
    } catch (error) {
      console.error('Error loading deals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) loadDeals();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, pipelineFilter]);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; class: string }> = {
      open: { text: 'Активна', class: 'badge badge-primary' },
      won: { text: 'Выиграна', class: 'badge badge-success' },
      lost: { text: 'Проиграна', class: 'badge badge-danger' },
    };
    const badge = badges[status] || badges.open;
    return <span className={badge.class}>{badge.text}</span>;
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить сделку?')) return;
    try {
      await dealsApi.delete(id);
      loadDeals();
    } catch (error) {
      console.error('Error deleting deal:', error);
      alert('Ошибка удаления');
    }
  };

  return (
    <div className="flex">
      <Sidebar user={user} />
      
      <div className="flex-1" style={{ marginLeft: '240px', background: 'var(--bg-secondary)', minHeight: '100vh' }}>
        <header className="header">
          <div className="px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Сделки
            </h2>
          </div>
        </header>

        <div className="px-6 py-6">
          <div className="card mb-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Поиск по названию..."
                className="input flex-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="input"
                value={pipelineFilter}
                onChange={(e) => setPipelineFilter(e.target.value)}
                style={{ width: '200px' }}
              >
                <option value="">Все воронки</option>
                {pipelines.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <select
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: '150px' }}
              >
                <option value="">Все статусы</option>
                <option value="open">Активные</option>
                <option value="won">Выигранные</option>
                <option value="lost">Проигранные</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="card">
              <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Всего</p>
              <p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{deals.length}</p>
            </div>
            <div className="card">
              <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Активных</p>
              <p className="text-2xl font-semibold" style={{ color: 'var(--accent)' }}>
                {deals.filter(d => d.status === 'open').length}
              </p>
            </div>
            <div className="card">
              <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Выиграно</p>
              <p className="text-2xl font-semibold" style={{ color: 'var(--success)' }}>
                {deals.filter(d => d.status === 'won').length}
              </p>
            </div>
            <div className="card">
              <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Сумма</p>
              <p className="text-2xl font-semibold" style={{ color: 'var(--accent)' }}>
                {deals.reduce((sum, d) => sum + d.amount, 0).toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {loading ? (
              <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>Загрузка...</div>
            ) : deals.length === 0 ? (
              <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>Сделок нет</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--bg-secondary)' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px' }}>Сделка</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px' }}>Сумма</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px' }}>Статус</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px' }}>Дата</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((deal) => (
                    <tr key={deal.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{deal.title}</p>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <p className="font-semibold" style={{ color: 'var(--accent)' }}>
                          {deal.amount.toLocaleString('ru-RU')} {deal.currency}
                        </p>
                      </td>
                      <td style={{ padding: '12px 16px' }}>{getStatusBadge(deal.status)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(deal.created_at).toLocaleDateString('ru-RU')}
                        </p>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          className="btn"
                          style={{ padding: '6px 12px', fontSize: '13px', background: 'var(--danger)', color: 'white' }}
                          onClick={() => handleDelete(deal.id)}
                        >Удал.
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
